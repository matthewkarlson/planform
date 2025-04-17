import { db } from '@/lib/db/drizzle';
import { ideas } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';
import ClientWrapper from '@/app/ideas/[id]/[stage]/ClientWrapper';
import { Suspense } from 'react';

// This function is used to safely access dynamic params
export async function generateMetadata(props: { params: Promise<{ id: string, stage: string }> }) {
  const params = await props.params;
  return {
    title: `Idea Stage: ${params.stage}`,
  };
}

export default async function StageView({ params }: { params: { id: string, stage: string } }) {
  // Properly await the params object before accessing its properties
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
  
  return (
    <ClientWrapper
      ideaId={id} 
      stageName={stage} 
      initialIdea={idea} 
    />
  );
} 