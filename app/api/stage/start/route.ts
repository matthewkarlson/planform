import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { stages, ideas } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { buildSystemPrompt } from '@/lib/llm/prompts';

// Schema for stage start request
const stageStartSchema = z.object({
  ideaId: z.string().uuid(),
  stageName: z.enum(['customer', 'designer', 'marketer', 'vc']),
});

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = stageStartSchema.parse(body);

    // Check if the idea exists and belongs to the user
    const ideaRecord = await db.query.ideas.findFirst({
      where: eq(ideas.id, validatedData.ideaId),
    });

    if (!ideaRecord || ideaRecord.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Idea not found or access denied' },
        { status: 404 }
      );
    }

    // Create a new stage
    const [newStage] = await db.insert(stages).values({
      ideaId: validatedData.ideaId,
      stageName: validatedData.stageName,
    }).returning({ stageId: stages.id });

    // Generate system prompt based on the idea and stage
    const systemPrompt = await buildSystemPrompt(
      ideaRecord, 
      validatedData.stageName
    );

    return NextResponse.json({ 
      stageId: newStage.stageId,
      systemPrompt
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error starting stage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 