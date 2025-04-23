import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { services } from '@/lib/db/schema';
import OpenAI from 'openai';
import puppeteer from 'puppeteer';
import { writeFile, mkdir, readdir, stat, unlink } from 'fs/promises';
import { join, dirname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { getUser } from '@/lib/db/queries';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Maximum number of screenshots to keep
const MAX_SCREENSHOTS = 10;

// Define the expected type for client responses
interface ClientResponses {
  [key: string]: string | string[] | undefined;
  websiteUrl?: string;
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
    let websiteAnalysis: WebsiteAnalysis | null = null;
    let screenshotBase64: string | null = null;
    let screenshotId: string | null = null;
    
    // Take screenshot and analyze website if URL is provided
    if (clientResponses.websiteUrl) {
      try {
        // Launch browser and capture screenshot
        const browser = await puppeteer.launch({ headless: true });
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
        
        // Create a unique ID for the screenshot file
        screenshotId = uuidv4();
        const screenshotsDir = join(process.cwd(), 'public', 'screenshots');
        const screenshotPath = join(screenshotsDir, `${screenshotId}.png`);
        
        // Ensure directory exists
        await mkdir(dirname(screenshotPath), { recursive: true });
        
        // Clean up old screenshots
        await cleanupScreenshots(screenshotsDir);
        
        // Save screenshot to file system
        await writeFile(screenshotPath, Buffer.from(screenshotBase64, 'base64'));
        
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

    // Fetch all services from the database
    const allServices = await db.select().from(services);
    
    if (!allServices.length) {
      return NextResponse.json({ error: 'No services found in database' }, { status: 404 });
    }

    // Create a prompt for OpenAI
    const prompt = `
      I have a client with the following responses to a questionnaire:
      ${JSON.stringify(clientResponses, null, 2)}
      
      Based on these responses, recommend the most appropriate services from this catalog:
      ${JSON.stringify(allServices, null, 2)}
      
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
      totalEstimatedCost: calculateTotalCost(parsedResponse.recommendations, allServices),
      websiteAnalysis: websiteAnalysis,
      // Include screenshot URL if available
      screenshotUrl: screenshotId ? `/screenshots/${screenshotId}.png` : null,
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