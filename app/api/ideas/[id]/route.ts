import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { ideas, messages, stages } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/').pop();
    if (!id) {
      return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    }

    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const idea = await db.query.ideas.findFirst({
      where: eq(ideas.id, id),
    });

    if (!idea) {
      return NextResponse.json(
        { error: 'Idea not found' },
        { status: 404 }
      );
    }

    // Check if the user has access to this idea
    if (idea.ownerId !== user.id) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json(idea);
  } catch (error) {
    console.error('Error fetching idea:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: ideaId } = await params;
    
    // Check if the idea belongs to the user
    const ideaToDelete = await db.query.ideas.findFirst({
      where: (ideas, { eq, and }) => 
        and(eq(ideas.id, ideaId), eq(ideas.ownerId, user.id)),
    });

    if (!ideaToDelete) {
      return NextResponse.json(
        { error: 'Idea not found or not authorized to delete' },
        { status: 404 }
      );
    }

    // Begin transaction to ensure all related data is deleted
    await db.transaction(async (tx) => {
      // First, get all stages related to this idea
      const relatedStages = await tx.query.stages.findMany({
        where: (stages, { eq }) => eq(stages.ideaId, ideaId),
      });
      
      // For each stage, delete its messages
      for (const stage of relatedStages) {
        await tx.delete(messages).where(eq(messages.stageId, stage.id));
      }
      
      // Delete all stages associated with the idea
      await tx.delete(stages).where(eq(stages.ideaId, ideaId));
      
      // Finally, delete the idea itself
      await tx.delete(ideas).where(eq(ideas.id, ideaId));
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting idea:', error);
    return NextResponse.json(
      { error: 'Failed to delete idea' },
      { status: 500 }
    );
  }
} 