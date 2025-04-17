import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { messages, stages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// Schema for get stage request
const getStageSchema = z.object({
  ideaId: z.string().uuid(),
  stageName: z.enum(['customer', 'designer', 'marketer', 'vc']),
});

export async function GET(request: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get params from URL
    const url = new URL(request.url);
    const ideaId = url.searchParams.get('ideaId');
    const stageName = url.searchParams.get('stageName');

    // Validate params
    const validatedData = getStageSchema.parse({ ideaId, stageName });

    // Find the stage
    const stageRecord = await db.query.stages.findFirst({
      where: (stages, { and, eq }) => and(
        eq(stages.ideaId, validatedData.ideaId),
        eq(stages.stageName, validatedData.stageName)
      ),
      with: {
        idea: true,
      },
    });

    // Check if stage exists and user has access
    if (!stageRecord) {
      return NextResponse.json({
        exists: false,
      });
    }

    if (stageRecord.idea.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Get messages for this stage
    const messageRecords = await db.query.messages.findMany({
      where: eq(messages.stageId, stageRecord.id),
      orderBy: (messages, { asc }) => [asc(messages.createdAt)],
    });

    // Format messages for the client
    const formattedMessages = messageRecords.map(msg => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
    }));

    return NextResponse.json({
      exists: true,
      stageId: stageRecord.id,
      messages: formattedMessages
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error fetching stage:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 