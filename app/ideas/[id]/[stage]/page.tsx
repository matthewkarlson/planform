import { db } from '@/lib/db/drizzle';
import { ideas, stages } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import ClientWrapper from '@/app/ideas/[id]/[stage]/ClientWrapper';
import { Metadata } from 'next';

type Params = Promise<{ id: string; stage: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id, stage } = await params;
  return {
    title: `Idea Stage: ${stage}`,
  };
}

export default async function StageView({ params }: { params: Params }) {
  const { id, stage } = await params;
  
  const user = await getUser();
  
  if (!user) {
    redirect('/login');
  }
  
  // Verify the idea exists and user has access
  const idea = await db.query.ideas.findFirst({
    where: eq(ideas.id, id),
  });
  
  if (!idea || idea.ownerId !== user.id) {
    redirect('/ideas');
  }
  
  // Check if this stage has been completed
  const stageRecord = await db.query.stages.findFirst({
    where: and(
      eq(stages.ideaId, id),
      eq(stages.stageName, stage)
    ),
  });
  
  const isReadOnly = stageRecord?.completedAt ? true : false;
  
  return (
    <ClientWrapper
      ideaId={id} 
      stageName={stage} 
      initialIdea={idea}
      isReadOnly={isReadOnly}
    />
  );
} 