import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { messages, stages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import OpenAI from 'openai';
import { buildSummarizationPrompt } from '@/lib/llm/prompts';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Schema for stage finish request
const stageFinishSchema = z.object({
  stageId: z.string().uuid(),
});

// Define the next stage mapping
const nextStageMap: Record<string, string | null> = {
  'customer': 'designer',
  'designer': 'marketer',
  'marketer': 'vc',
  'vc': null, // Final stage
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
    const validatedData = stageFinishSchema.parse(body);

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

    // Get conversation history
    const conversationHistory = await db.query.messages.findMany({
      where: eq(messages.stageId, validatedData.stageId),
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });

    if (conversationHistory.length === 0) {
      return NextResponse.json(
        { error: 'No conversation found for this stage' },
        { status: 400 }
      );
    }

    // Extract score from the last AI message if it contains stage_complete
    let score = 0;
    try {
      const aiMessages = conversationHistory.filter(msg => msg.role === 'ai');
      const lastAiMessage = aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : null;
      
      if (lastAiMessage && lastAiMessage.content) {
        if (lastAiMessage.content.includes('"stage_complete": true')) {
          const jsonStart = lastAiMessage.content.indexOf('{');
          const jsonEnd = lastAiMessage.content.lastIndexOf('}') + 1;
          if (jsonStart !== -1 && jsonEnd !== -1) {
            const jsonStr = lastAiMessage.content.substring(jsonStart, jsonEnd);
            const parsedJson = JSON.parse(jsonStr);
            if (typeof parsedJson.score === 'number') {
              score = parsedJson.score;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error extracting score:', error);
    }

    // Create a summary of the conversation
    const summarizationPrompt = buildSummarizationPrompt(
      conversationHistory.map(msg => ({
        role: msg.role || 'user', // Default to 'user' if null
        content: msg.content || '',
      }))
    );

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: summarizationPrompt }],
      temperature: 0.3,
    });

    let summary;
    try {
      // Try to parse summary as JSON
      const jsonContent = response.choices[0].message.content || '';
      summary = JSON.parse(jsonContent);
    } catch (error) {
      // If not valid JSON, use as plain text
      summary = { 
        key_points: [response.choices[0].message.content],
        score: score,
        blocking_risks: []
      };
    }

    // Update the stage with summary, score, and mark as completed
    await db.update(stages)
      .set({
        summary,
        score,
        completedAt: new Date(),
      })
      .where(eq(stages.id, validatedData.stageId));

    // Determine the next stage
    const currentStageName = stageRecord.stageName as string;
    const nextStage = nextStageMap[currentStageName] || null;

    return NextResponse.json({ 
      nextStage,
      summary,
      score
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error finishing stage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 