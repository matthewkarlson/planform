import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { agencies, services, clients, plans } from '@/lib/db/schema';
import OpenAI from 'openai';
import puppeteerCore from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { writeFile, mkdir, readdir, stat, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '@/lib/db/queries';
import { existsSync } from 'fs';
import { eq } from 'drizzle-orm';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds
const RATE_LIMIT_MAX = 10; // Maximum 10 requests per hour

// Simple in-memory store for rate limiting
// Note: This will reset on server restart and doesn't work across multiple instances
// For production, use Redis or another persistent store
type RateLimitStore = {
  [key: string]: {
    count: number;
    resetAt: number;
  }
};

const rateLimitStore: RateLimitStore = {};

// Rate limit function
function checkRateLimit(identifier: string): { allowed: boolean; resetAt: number; current: number; limit: number } {
  const now = Date.now();
  
  // Initialize or reset expired entries
  if (!rateLimitStore[identifier] || now > rateLimitStore[identifier].resetAt) {
    rateLimitStore[identifier] = {
      count: 0,
      resetAt: now + RATE_LIMIT_WINDOW
    };
  }
  
  // Increment count
  rateLimitStore[identifier].count += 1;
  
  return {
    allowed: rateLimitStore[identifier].count <= RATE_LIMIT_MAX,
    resetAt: rateLimitStore[identifier].resetAt,
    current: rateLimitStore[identifier].count,
    limit: RATE_LIMIT_MAX
  };
}

// Maximum number of screenshots to keep
const MAX_SCREENSHOTS = 10;

// Define the expected type for client responses
interface ClientResponses {
  [key: string]: string | string[] | undefined;
  websiteUrl?: string;
  agencyId?: string;
  apiKey?: string;
  email?: string;
  name?: string;
}

// Define the structure for service recommendations
type ServiceRecommendation = {
  serviceId: string;
  reason: string;
};

// Define the structure for website analysis
type WebsiteAnalysis = {
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  overallImpression: string;
};

// Define the response structure that will be received from OpenAI
type AIResponse = {
  recommendations: ServiceRecommendation[];
  executiveSummary: string;
};

/**
 * Cleans up old screenshots, keeping only the most recent ones
 * @param screenshotsDir Directory containing screenshots
 */
async function cleanupScreenshots(screenshotsDir: string): Promise<void> {
  try {
    // Ensure the directory exists
    await mkdir(screenshotsDir, { recursive: true });
    
    // Get all files in the screenshots directory
    const files = await readdir(screenshotsDir);
    
    // Filter out non-PNG files
    const pngFiles = files.filter(file => file.endsWith('.png'));
    
    // If we're under the limit, no need to delete anything
    if (pngFiles.length <= MAX_SCREENSHOTS) {
      return;
    }
    
    // Get file stats for each PNG file
    const fileStats = await Promise.all(
      pngFiles.map(async (file) => {
        const filePath = join(screenshotsDir, file);
        const stats = await stat(filePath);
        return {
          name: file,
          path: filePath,
          createdAt: stats.birthtime,
        };
      })
    );
    
    // Sort files by creation date (oldest first)
    fileStats.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    
    // Delete oldest files to keep only MAX_SCREENSHOTS
    const filesToDelete = fileStats.slice(0, fileStats.length - MAX_SCREENSHOTS);
    
    // Delete each file
    for (const file of filesToDelete) {
      await unlink(file.path);
      console.log(`Deleted old screenshot: ${file.name}`);
    }
  } catch (error) {
    // Log the error but don't fail the request
    console.error('Error cleaning up screenshots:', error);
  }
}

// Helper function to find a Chrome executable
async function findChromeExecutable(): Promise<string | null> {
  // Common Chrome locations on MacOS
  const macOSChromePaths = [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
  ];
  
  // Check each path
  for (const path of macOSChromePaths) {
    try {
      if (existsSync(path)) {
        console.log(`Found Chrome at: ${path}`);
        return path;
      }
    } catch (e) {
      // Ignore error and continue to next path
    }
  }
  
  console.log('No Chrome installation found in common locations');
  return null;
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const clientResponses: ClientResponses = await request.json();
    
    // Get API key from request body instead of URL parameters for better security
    const apiKey = clientResponses.apiKey as string;
    const user = await getUser();
    
    // Create an identifier for rate limiting (use API key, user ID, or IP)
    const identifier = apiKey || (user?.id?.toString() || '') || request.headers.get('x-forwarded-for') || 'anonymous';
    
    // Check rate limit
    const rateLimit = checkRateLimit(identifier);
    
    // If rate limit exceeded, return 429 Too Many Requests
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetAt).toISOString();
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          resetAt: resetDate,
          current: rateLimit.current,
          limit: rateLimit.limit
        }, 
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimit.limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': resetDate,
            'Retry-After': Math.ceil((rateLimit.resetAt - Date.now()) / 1000).toString()
          }
        }
      );
    }
    
    if (!apiKey) {
      return NextResponse.json({ error: 'Authentication via api key is required' }, { status: 401 });
    }

    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.apiKey, apiKey),
      columns: {
        id: true,
        name: true,
        description: true,
        currency: true,
      },
    });
    

    let websiteAnalysis: WebsiteAnalysis | null = null;
    let screenshotBase64: string | null = null;
    let screenshotId: string | null = null;
    
    // Take screenshot and analyze website if URL is provided
    if (clientResponses.websiteUrl) {
      try {
        // Check if running locally or in production
        const isLocal = process.env.NODE_ENV === 'development';
        console.log(`Running in ${isLocal ? 'development' : 'production'} mode`);
        
        let browser;
        
        try {
          if (isLocal) {
            console.log('Using local Chrome installation');
            // For local development, use the system Chrome/Chromium
            const chromeExecutablePath = await findChromeExecutable();
            
            if (!chromeExecutablePath) {
              throw new Error('Could not find a Chrome installation. Please install Chrome, Chromium, Edge, or Brave browser.');
            }
            
            browser = await puppeteerCore.launch({
              headless: true,
              executablePath: chromeExecutablePath,
              args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
          } else {
            console.log('Using @sparticuz/chromium for serverless');
            // For Vercel serverless functions, use @sparticuz/chromium
            chromium.setGraphicsMode = false;
            const browserArgs = [...chromium.args, '--ignore-certificate-errors'];
            
            browser = await puppeteerCore.launch({
              args: browserArgs,
              defaultViewport: chromium.defaultViewport,
              executablePath: await chromium.executablePath(),
              headless: chromium.headless,
            });
          }
          console.log('Browser launched successfully');
        } catch (browserError) {
          console.error('Error launching browser:', browserError);
          throw browserError;
        }
        
        const page = await browser.newPage();
        await page.setViewport({
          width: 1366,
          height: 768,
          deviceScaleFactor: 1,
        });
       console.log('Navigating to website: ', clientResponses.websiteUrl);
        await page.goto(clientResponses.websiteUrl, {
          waitUntil: 'networkidle2',
          timeout: 10000,
        });
         // 1) Try clicking consent buttons
        await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button, a'));
          const re = /^(accept|allow|ok)/i;
          const btn = btns.find(b => re.test(b.textContent?.trim() || ''));
          if (btn) {
            (btn as HTMLElement).click();
          }
        });

        // 2) Fallback: hide any remaining banners
        await page.addStyleTag({
          content: `[class*="cookie"], [id*="cookie"], .consent, .cc-banner { display: none !important; }`
        });
        // Capture screenshot as base64
        const screenshot = await page.screenshot({ encoding: "base64" });
        screenshotBase64 = screenshot.toString();
        
        // Create a unique ID for the screenshot
        screenshotId = uuidv4();
        
        // For local development, save to public directory for static serving
        if (isLocal) {
          const screenshotsDir = join(process.cwd(), 'public', 'screenshots');
          const screenshotPath = join(screenshotsDir, `${screenshotId}.png`);
          
          // Ensure directory exists
          await mkdir(dirname(screenshotPath), { recursive: true });
          
          // Clean up old screenshots
          await cleanupScreenshots(screenshotsDir);
          
          // Save screenshot to file system (local only)
          if (screenshotBase64) {
            await writeFile(screenshotPath, Buffer.from(screenshotBase64, 'base64'));
          }
        } else {
          // In serverless environment, optionally save to /tmp for debugging
          // but we'll return the base64 data directly in the response
          console.log('In serverless environment, not saving screenshot to filesystem');
          
          // Optional: If you need to save for debugging/logs
          try {
            const tmpScreenshotPath = join('/tmp', `${screenshotId}.png`);
            if (screenshotBase64) {
              await writeFile(tmpScreenshotPath, Buffer.from(screenshotBase64, 'base64'));
              console.log(`Saved debug screenshot to ${tmpScreenshotPath}`);
            }
          } catch (writeError) {
            console.error('Warning: Could not write debug screenshot to /tmp', writeError);
            // Continue processing, this is just for debugging
          }
        }
        console.log('Closing browser');
        await browser.close();
        // Analyze website using OpenAI
        console.log('Analyzing website');
        const websiteResponse = await openai.responses.create({
          model: "gpt-4.1-mini",
          input: [
            {
              role: "system",
              content: "You are an expert web design and marketing consultant. Analyze this website screenshot and provide specific, actionable feedback."
            },
            {
              role: "user", 
              content: [
                { 
                  type: "input_text", 
                  text: `Analyze the first fold of this website (${clientResponses.websiteUrl}) and provide insights on its design, user experience, and effectiveness. Focus on strengths, weaknesses, and actionable recommendations. Don't mention the client's name, but you can mention the company name. The client has provided the following answers to a questionnaire: ${JSON.stringify(clientResponses, null, 2)}` 
                },
                {
                  type: "input_image",
                  detail: "high",
                  image_url: `data:image/png;base64,${screenshotBase64}`
                }
              ]
            }
          ],
          text: {
            format: {
              type: "json_schema",
              name: "website_analysis",
              schema: {
                type: "object",
                properties: {
                  companyName:{
                    type: "string",
                    description: "The name of the company"
                  },
                  strengths: {
                    type: "array",
                    items: { type: "string" },
                    description: "Key strengths of the website"
                  },
                  weaknesses: {
                    type: "array",
                    items: { type: "string" },
                    description: "Areas for improvement"
                  },
                  recommendations: {
                    type: "array",
                    items: { type: "string" },
                    description: "Specific recommendations for improvement"
                  },
                  overallImpression: {
                    type: "string",
                    description: "Overall impression of the website"
                  }
                },
                required: ["companyName", "strengths", "weaknesses", "recommendations", "overallImpression"],
                additionalProperties: false
              },
              strict: true
            }
          }
        });
        
        // Parse website analysis response
        const parsedWebsiteResponse: WebsiteAnalysis = JSON.parse(websiteResponse.output_text);
        websiteAnalysis = parsedWebsiteResponse;
      } catch (error) {
        console.error('Error analyzing website:', error);
        // Continue with service recommendations even if website analysis fails
      }
    }

    // Fetch services filtered by agency ID
    if (!agency) {
      return NextResponse.json(
        { error: 'No agency found for this API key' },
        { status: 404 }
      );
    }
    const agencyServices = await db
      .select()
      .from(services)
      .where(eq(services.agencyId, agency.id));
    
    if (!agencyServices.length) {
      return NextResponse.json(
        { error: 'No services found for this agency' },
        { status: 404 }
      );
    }
    // Create a prompt for OpenAI
    const prompt = `
      I have a client with the following responses to a questionnaire:
      ${JSON.stringify(clientResponses, null, 2)}

      We have analyzed the first fold of their website and provided the following feedback:
      ${JSON.stringify(websiteAnalysis, null, 2)}
      
      Based on these responses, recommend the most appropriate services from this catalog:
      ${JSON.stringify(agencyServices, null, 2)}
      
      For each recommended service, provide a clear justification based on the client's specific needs.
      Your response will be shown to the client so it should be addressed to them.
      You should be specific with the transformation that the service you are recommending will deliver to the client.
    `;
    const systemPrompt = `
      You are an expert business consultant that works for ${agency.name} and helps match client needs to appropriate services. Provide structured, specific recommendations that are directly tied to the client's responses.
      a brief description of the agency is: ${agency.description}. Keep this in mind and remember you work for this agency.
    `;

    // Call OpenAI using the responses API with structured schema
    console.log('Calling OpenAI for full analysis');
    const aiResponse = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: systemPrompt
        },
        {
          role: "user",
          content: prompt
        }
      ],
      text: {
        format: {
          type: "json_schema",
          name: "service_recommendations",
          schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    serviceId: {
                      type: "string",
                      description: "The unique identifier for the recommended service from the catalog"
                    },
                    reason: {
                      type: "string",
                      description: "A clear justification for why this service is recommended based on the client's needs"
                    }
                  },
                  required: ["serviceId", "reason"],
                  additionalProperties: false
                }
              },
              executiveSummary: { 
                type: "string",
                description: "A concise summary of the plan that will be shown to the client, with a clear emphasis on the transformation that the services will deliver. Showing the customer where they are now,  and where they could be if they went with our services. Demonstrating the pain points our services will address."
              }
            },
            required: ["recommendations", "executiveSummary"],
            additionalProperties: false
          },
          strict: true
        }
      }
    });

    // Parse the response
    const parsedResponse: AIResponse = JSON.parse(aiResponse.output_text);
    
    // Structure the final response
    const response = {
      clientResponses,
      recommendations: parsedResponse.recommendations,
      executiveSummary: parsedResponse.executiveSummary,
      totalEstimatedCost: calculateTotalCost(parsedResponse.recommendations, agencyServices, agency.currency),
      websiteAnalysis: websiteAnalysis,
      // Check environment for how to return screenshot data
      screenshotUrl: process.env.NODE_ENV === 'development' && screenshotId ? 
        `/screenshots/${screenshotId}.png` : 
        null,
      // Include base64 data for production/serverless environments
      screenshotBase64: process.env.NODE_ENV !== 'development' ? 
        screenshotBase64 : 
        null,
    };

    // Store the analysis in the database if client email is provided
    if (clientResponses.email) {
      try {
        // Check if the client already exists
        let client = await db.query.clients.findFirst({
          where: eq(clients.email, clientResponses.email as string),
        });

        // If client doesn't exist, create a new one
        if (!client) {
          const [newClient] = await db.insert(clients).values({
            name: clientResponses.name as string || 'Unknown',
            email: clientResponses.email as string,
            agencyId: agency.id,
            websiteUrl: clientResponses.websiteUrl as string || null,
          }).returning();
          
          client = newClient;
        }

        // Create a clean version of the response data without screenshot information
        const cleanResponseData = {
          clientResponses,
          recommendations: parsedResponse.recommendations,
          executiveSummary: parsedResponse.executiveSummary,
          totalEstimatedCost: calculateTotalCost(parsedResponse.recommendations, agencyServices, agency.currency),
          websiteAnalysis: websiteAnalysis,
        };

        // Store the plan data without screenshot information
        await db.insert(plans).values({
          clientId: client.id,
          agencyId: agency.id,
          planData: cleanResponseData,
        });

        console.log(`Plan saved for client: ${client.email}`);
      } catch (dbError) {
        console.error('Error storing plan in database:', dbError);
        // Continue with the response even if DB storage fails
      }
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error analyzing client responses:', error);
    return NextResponse.json(
      { error: 'Failed to analyze client responses' }, 
      { status: 500 }
    );
  }
}

// Helper function to calculate total cost based on recommended services
function calculateTotalCost(
  recommendations: ServiceRecommendation[], 
  allServices: typeof services.$inferSelect[],
  currency: string | null
) {
  let minTotal = 0;
  let maxTotal = 0;

  for (const rec of recommendations) {
    const service = allServices.find(s => s.serviceId === rec.serviceId);
    if (service) {
      // Add to min total if priceLower exists
      if (service.priceLower) {
        minTotal += service.priceLower;
      }
      
      // Add to max total if priceUpper exists
      if (service.priceUpper) {
        maxTotal += service.priceUpper;
      }
    }
  }

  return {
    minTotal,
    maxTotal,
    formattedRange: minTotal && maxTotal ? `${currency} ${minTotal.toLocaleString()} - ${currency} ${maxTotal.toLocaleString()}` : 'Price upon request'
  };
} 