import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { services } from '@/lib/db/schema';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define the expected type for client responses
type ClientResponses = {
  [key: string]: string | string[];
};

// Define the structure for service recommendations
type ServiceRecommendation = {
  serviceId: string;
  reason: string;
};

// Define the response structure that will be received from OpenAI
type AIResponse = {
  recommendations: ServiceRecommendation[];
};

export async function POST(request: Request) {
  try {
    // Parse the request body
    const clientResponses: ClientResponses = await request.json();

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