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

    // Convert conversation to a flat string format for summarization
    const conversationText = conversationHistory
      .map(msg => `${msg.role === 'ai' ? 'AI' : 'User'}: ${msg.content}`)
      .join('\n\n');

    // Create a summary of the conversation
    const summarizationPrompt = buildSummarizationPrompt(conversationText);

    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: summarizationPrompt }],
      temperature: 0.3,
    });

    const summary = response.choices[0].message.content || '';
    
    // For VC stage, try to extract score from the summary or assign default
    let score = 0;
    if (stageRecord.stageName === 'vc') {
      // Try to find a score in the format like "Score: 7/10" or similar patterns
      const scorePattern = /(?:score|rating):\s*(\d+)(?:\/10)?|(\d+)(?:\/10)\s*(?:score|rating)/i;
      const scoreMatch = summary.match(scorePattern);
      if (scoreMatch) {
        score = parseInt(scoreMatch[1] || scoreMatch[2], 10);
      }
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