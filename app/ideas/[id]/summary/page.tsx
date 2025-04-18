import Link from 'next/link';
import { db } from '@/lib/db/drizzle';
import { ideas, stages } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';
import { notFound, redirect } from 'next/navigation';
import SummaryClient from '@/components/SummaryClient';

// Helper function to get emoji based on score
function getScoreEmoji(score: number): string {
  if (score >= 8) return '🌟';
  if (score >= 6) return '👍';
  if (score >= 4) return '👌';
  if (score >= 2) return '🤔';
  return '👎';
}

interface StageSummary {
  name: string;
  icon: string;
  completed: boolean;
  summary: any;
  score: number | null;
}

type tParams = Promise<{ id: string }>;

export default async function SummaryPage(props: { params: tParams }) {
  const params = await props.params;
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get the ID from params
  const id = params.id;

  // Fetch idea details
  const idea = await db.query.ideas.findFirst({
    where: eq(ideas.id, id),
  });

  if (!idea || idea.ownerId !== user.id) {
    notFound();
  }

  // Fetch all completed stages
  const stageDetails = await db.query.stages.findMany({
    where: eq(stages.ideaId, id),
  });

  const stageMap: Record<string, StageSummary> = {
    customer: {
      name: 'Customer Validation',
      icon: '👤',
      completed: false,
      summary: null,
      score: null,
    },
    designer: {
      name: 'Designer Feedback',
      icon: '🎨',
      completed: false,
      summary: null,
      score: null,
    },
    marketer: {
      name: 'Market Strategy',
      icon: '📊',
      completed: false,
      summary: null,
      score: null,
    },
    vc: {
      name: 'Business Potential',
      icon: '💰',
      completed: false,
      summary: null,
      score: null,
    },
  };

  // Update stage map with completed stages
  for (const stage of stageDetails) {
    if (stage.stageName && stage.completedAt && stage.summary) {
      const stageName = stage.stageName as keyof typeof stageMap;
      
      if (stageName in stageMap) {
        stageMap[stageName].completed = true;
        // Parse the JSON string to an object if it's a string
        try {
          stageMap[stageName].summary = typeof stage.summary === 'string' 
            ? JSON.parse(stage.summary) 
            : stage.summary;
        } catch (e) {
          // If parsing fails, use the original summary
          stageMap[stageName].summary = stage.summary;
        }
        stageMap[stageName].score = stage.score;
      }
    }
  }

  // Calculate overall score (average of all completed stages)
  const completedStages = Object.values(stageMap).filter(
    (stage) => stage.completed && typeof stage.score === 'number'
  );

  const overallScore = completedStages.length > 0
    ? Math.round(
        completedStages.reduce((sum, stage) => sum + (stage.score || 0), 0) /
        completedStages.length
      )
    : null;

  return (
    <SummaryClient 
      idea={idea}
      ideaId={id}
      stageMap={stageMap}
      overallScore={overallScore} 
      completedStageCount={completedStages.length}
    />
  );
} 