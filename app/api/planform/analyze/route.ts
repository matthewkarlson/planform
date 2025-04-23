import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { services } from '@/lib/db/schema';
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

// Maximum number of screenshots to keep
const MAX_SCREENSHOTS = 10;

// Define the expected type for client responses
interface ClientResponses {
  [key: string]: string | string[] | undefined;
  websiteUrl?: string;
  agencyId?: string;
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
    // Check if user is logged in and verified
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if user's email is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Email verification required to use this feature' },
        { status: 403 }
      );
    }

    // Parse the request body
    const clientResponses: ClientResponses = await request.json();
    
    // Check for agency ID
    if (!clientResponses.agencyId) {
      return NextResponse.json(
        { error: 'Agency ID is required' },
        { status: 400 }
      );
    }

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
          width: 1240,
          height: 700,
          deviceScaleFactor: 1,
        });
        
        await page.goto(clientResponses.websiteUrl, {
          waitUntil: 'networkidle2',
          timeout: 60000,
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
        
        await browser.close();
        
        // Analyze website using OpenAI
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
                  text: `Analyze this website (${clientResponses.websiteUrl}) and provide insights on its design, user experience, and effectiveness. Focus on strengths, weaknesses, and actionable recommendations.` 
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
                required: ["strengths", "weaknesses", "recommendations", "overallImpression"],
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
    const agencyServices = await db
      .select()
      .from(services)
      .where(eq(services.agencyId, parseInt(clientResponses.agencyId)));
    
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
      
      Based on these responses, recommend the most appropriate services from this catalog:
      ${JSON.stringify(agencyServices, null, 2)}
      
      For each recommended service, provide a clear justification based on the client's specific needs.
      Your response will be shown to the client so it should be addressed to them.
      You should be specific with the transformation that the service you are recommending will deliver to the client.
    `;

    // Call OpenAI using the responses API with structured schema
    const aiResponse = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "system",
          content: "You are an expert business consultant that helps match client needs to appropriate services. Provide structured, specific recommendations that are directly tied to the client's responses."
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
              }
            },
            required: ["recommendations"],
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
      totalEstimatedCost: calculateTotalCost(parsedResponse.recommendations, agencyServices),
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
  allServices: typeof services.$inferSelect[]
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
    formattedRange: minTotal && maxTotal ? `$${minTotal.toLocaleString()} - $${maxTotal.toLocaleString()}` : 'Price upon request'
  };
} 