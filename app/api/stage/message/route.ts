import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { messages, stages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Schema for message request
const messageSchema = z.object({
  stageId: z.string().uuid(),
  message: z.string().min(1, "Message cannot be empty"),
});

// Define the types for OpenAI message inputs
type MessageRole = 'user' | 'assistant' | 'system';
type MessageInput = {
  role: MessageRole;
  content: string;
};

export async function POST(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const validatedData = messageSchema.parse(body);

    // Verify stage exists and user has access
    const stageRecord = await db.query.stages.findFirst({
      where: eq(stages.id, validatedData.stageId),
      with: {
        idea: true,
      },
    });

    if (!stageRecord || stageRecord.idea.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Stage not found or access denied' },
        { status: 404 }
      );
    }

    // Store user message
    await db.insert(messages).values({
      stageId: validatedData.stageId,
      role: 'user',
      content: validatedData.message,
    });

    // Get conversation history
    const conversationHistory = await db.query.messages.findMany({
      where: eq(messages.stageId, validatedData.stageId),
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });

    // Format messages for OpenAI API - using proper types
    const formattedInput: MessageInput[] = [];
    
    for (const msg of conversationHistory) {
      if (msg.role === 'user') {
        formattedInput.push({
          role: 'user',
          content: msg.content || '',
        });
      } else {
        formattedInput.push({
          role: 'assistant',
          content: msg.content || '',
        });
      }
    }

    // Create a system message if this is the first user message
    let systemContent = '';
    if (formattedInput.length === 1) {
      const idea = stageRecord.idea;
      const { buildSystemPrompt } = await import('@/lib/llm/prompts');
      systemContent = await buildSystemPrompt(idea, stageRecord.stageName as any);
    }

    if (systemContent) {
      formattedInput.unshift({
        role: 'system',
        content: systemContent,
      });
    }

    // Create stream response
    const encoder = new TextEncoder();
    let responseText = '';
    let isStageComplete = false;

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            const stream = await openai.responses.create({
              model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
              input: formattedInput,
              temperature: 0.7,
              stream: true,
            });

            for await (const event of stream) {
              if (event.type === 'response.output_text.delta') {
                responseText += event.delta;
                controller.enqueue(encoder.encode(event.delta));
              } else if (event.type === 'error') {
                controller.enqueue(encoder.encode(`Error: ${event.message}`));
              }
            }

            // Check if the stage is complete
            try {
              // Look for the structured JSON object with stage_complete: true
              // Try both with and without backticks in case they're included in response
              const jsonRegex = /```json\s*({[\s\S]*?})\s*```|({[\s\S]*?"stage_complete"\s*:\s*true[\s\S]*?})/i;
              const match = responseText.match(jsonRegex);
              
              if (match) {
                // Use the first capture group that matched
                const jsonStr = match[1] || match[2];
                
                try {
                  const parsedJson = JSON.parse(jsonStr);
                  if (parsedJson.stage_complete === true) {
                    isStageComplete = true;
                    console.log("Stage completion detected:", parsedJson);
                  }
                } catch (parseError) {
                  console.error("Error parsing JSON in completion response:", parseError);
                }
              } else if (responseText.includes('"stage_complete": true') || 
                         responseText.includes('"stage_complete":true')) {
                // Fallback detection if JSON parsing fails
                isStageComplete = true;
                console.log("Stage completion detected via text match");
              }
            } catch (error) {
              console.error('Error parsing stage complete status:', error);
            }

            // Save AI message to database
            await db.insert(messages).values({
              stageId: validatedData.stageId,
              role: 'ai',
              content: responseText,
            });

            controller.close();
          } catch (error) {
            console.error('Error calling OpenAI:', error);
            controller.enqueue(encoder.encode(JSON.stringify({ error: 'Failed to generate response' })));
            controller.close();
          }
        }
      }),
      {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          ...(isStageComplete ? { 'X-Stage-Complete': 'true' } : {})
        }
      }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error processing message:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Add GET method to fetch messages for a stage
export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get stageId from URL
    const url = new URL(request.url);
    const stageId = url.searchParams.get('stageId');

    if (!stageId) {
      return NextResponse.json(
        { error: 'Stage ID is required' },
        { status: 400 }
      );
    }

    // Verify stage exists and user has access
    const stageRecord = await db.query.stages.findFirst({
      where: eq(stages.id, stageId),
      with: {
        idea: true,
      },
    });

    if (!stageRecord || stageRecord.idea.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Stage not found or access denied' },
        { status: 404 }
      );
    }

    // Get conversation history
    const conversationHistory = await db.query.messages.findMany({
      where: eq(messages.stageId, stageId),
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });

    return NextResponse.json({
      messages: conversationHistory
    });
  } catch (error) {
    console.error('Error retrieving messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 