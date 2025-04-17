import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { messages, stages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import OpenAI from 'openai';
import { buildSystemPrompt } from '@/lib/llm/prompts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Schema for message request
const messageSchema = z.object({
  stageId: z.string().uuid(),
  messages: z.array(
    z.object({
      role: z.enum(['user', 'assistant', 'system']),
      content: z.string(),
    })
  )
});

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

    // Save user message to database (only the last one that was sent)
    const userMessages = validatedData.messages.filter(m => m.role === 'user');
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1];
      await db.insert(messages).values({
        stageId: validatedData.stageId,
        role: 'user',
        content: lastUserMessage.content,
      });
    }

    // Ensure we get the system prompt as the first message
    let prompt: string;
    let formattedInput: MessageInput[] = [];

    // Check if a system message already exists in provided messages
    const hasSystemMessage = validatedData.messages.some(m => m.role === 'system');

    if (!hasSystemMessage) {
      // Generate a system prompt for this stage
      prompt = await buildSystemPrompt(stageRecord.idea, stageRecord.stageName as 'customer' | 'designer' | 'marketer' | 'vc');
      formattedInput = [
        { role: 'system', content: prompt },
        ...validatedData.messages
      ];
    } else {
      formattedInput = validatedData.messages;
    }

    // Stream response to the client
    const encoder = new TextEncoder();
    let isStageComplete = false;
    let responseText = "";

    return new Response(
      new ReadableStream({
        async start(controller) {
          try {
            // Prepare streaming response
            const stream = await openai.chat.completions.create({
              model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
              messages: formattedInput,
              temperature: 0.7,
              stream: true,
            });

            for await (const chunk of stream) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                responseText += content;
                controller.enqueue(encoder.encode(content));
              }
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
          'Connection': 'keep-alive'
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