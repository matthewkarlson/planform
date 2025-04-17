'use client';

import dynamic from 'next/dynamic';
import { ideas } from '@/lib/db/schema';

// Import the client component with no SSR to avoid server/client mismatch
const PersonaChatClient = dynamic(() => import('@/components/PersonaChatClient'), { 
  ssr: false 
});

// Use the inferred type from the ideas table
type Idea = typeof ideas.$inferSelect;

interface ClientWrapperProps {
  ideaId: string;
  stageName: string;
  initialIdea: Idea;
}

export default function ClientWrapper({ ideaId, stageName, initialIdea }: ClientWrapperProps) {
  return (
    <PersonaChatClient 
      ideaId={ideaId} 
      stageName={stageName} 
      initialIdea={initialIdea} 
    />
  );
} 