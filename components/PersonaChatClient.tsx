'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ChatWindow from '@/components/ChatWindow';
import ProgressStepper from '@/components/ProgressStepper';

export interface Idea {
  id: string;
  title: string | null;
  rawIdea: string | null;
  idealCustomer?: string | null;
  problem?: string | null;
  currentSolutions?: string | null;
  valueProp?: string | null;
  createdAt: Date | null;
  ownerId: number;
}

export interface Persona {
  name: string;
  role: string;
  goal: string;
  avatarUrl: string;
  tips: string[];
}

const personaMap: Record<string, Persona> = {
  customer: {
    name: 'Jordan',
    role: 'Potential Customer',
    goal: 'Validate whether this idea solves a real pain point, and if it\'s something they would pay for.',
    avatarUrl: '/avatars/customer.png',
    tips: [
      'Explain your problem and current workarounds',
      'Ask about pricing and features',
      'Share what would make you purchase it',
      'Be honest about any concerns',
    ],
  },
  designer: {
    name: 'Ava',
    role: 'UX/UI Designer',
    goal: 'Help define the minimum viable product (MVP) by identifying core features and challenging unnecessary complexity.',
    avatarUrl: '/avatars/designer.png',
    tips: [
      'Focus on the core user journey',
      'Clarify the most important features',
      'Discuss potential technical challenges',
      'Simplify the feature set for MVP',
    ],
  },
  marketer: {
    name: 'Zeke',
    role: 'Growth Marketer',
    goal: 'Identify potential go-to-market strategies and suggest testable experiments to validate market assumptions.',
    avatarUrl: '/avatars/marketer.png',
    tips: [
      'Define your target customer segments',
      'Discuss acquisition channels',
      'Explore potential messaging',
      'Plan small experiments to validate demand',
    ],
  },
  vc: {
    name: 'Morgan',
    role: 'Venture Capitalist',
    goal: 'Evaluate the business potential of this idea and assign a score from 0-10 based on its investment worthiness.',
    avatarUrl: '/avatars/vc.png',
    tips: [
      'Explain your market size and opportunity',
      'Discuss your business model',
      'Address potential scaling challenges',
      'Talk about the competitive landscape',
    ],
  },
};

// The stages in order
const stages = ['customer', 'designer', 'marketer', 'vc'];

interface PersonaChatClientProps {
  ideaId: string;
  stageName: string;
  initialIdea: Idea;
  isReadOnly?: boolean;
}

export default function PersonaChatClient({ ideaId, stageName, initialIdea, isReadOnly = false }: PersonaChatClientProps) {
  const router = useRouter();
  const [stageId, setStageId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentStage = stageName || 'customer';
  const persona = personaMap[currentStage] || personaMap.customer;
  const stageIndex = stages.indexOf(currentStage);
  const progress = ((stageIndex + 1) / stages.length) * 100;

  useEffect(() => {
    if (!ideaId || !currentStage) return;
    let isComponentMounted = true;

    // Check if a stage already exists for this idea and stage name
    const getExistingStage = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/stage/get?ideaId=${ideaId}&stageName=${currentStage}`);
        
        if (!response.ok) {
          throw new Error('Failed to check for existing stage');
        }
        
        const data = await response.json();
        
        if (!isComponentMounted) return;
        
        if (data.exists) {
          // Stage already exists, use the existing stageId
          setStageId(data.stageId);
        } else {
          // Stage doesn't exist, create a new one
          await startNewStage();
        }
      } catch (error) {
        console.error('Error checking for existing stage:', error);
        if (isComponentMounted) {
          setError('Failed to load conversation. Please try again.');
          // Fall back to starting a new stage
          await startNewStage();
        }
      } finally {
        if (isComponentMounted) {
          setIsLoading(false);
        }
      }
    };

    // Start a new stage
    const startNewStage = async () => {
      if (!isComponentMounted) return;
      
      try {
        const response = await fetch('/api/stage/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ideaId,
            stageName: currentStage,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to start stage');
        }

        const data = await response.json();
        if (isComponentMounted) {
          setStageId(data.stageId);
        }
      } catch (error) {
        console.error('Error starting stage:', error);
        if (isComponentMounted) {
          setError('Failed to start conversation. Please try again.');
        }
      }
    };

    getExistingStage();
    
    return () => {
      isComponentMounted = false;
    };
  }, [ideaId, currentStage]);

  // Handle navigation back to ideas list
  const handleBackToIdeas = () => {
    router.push('/ideas');
  };

  const handleStageComplete = async () => {
    if (!stageId) return;
    
    try {
      const response = await fetch('/api/stage/finish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stageId,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to finish stage');
      }

      const data = await response.json();
      
      if (data.nextStage) {
        // Navigate to the next stage
        router.push(`/ideas/${ideaId}/${data.nextStage}`);
      } else {
        // If no next stage, navigate to the summary dashboard
        router.push(`/ideas/${ideaId}/summary`);
      }
    } catch (error) {
      console.error('Error finishing stage:', error);
      setError('Failed to complete stage. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 text-red-700 p-4 rounded-md">
          <p>{error}</p>
          <button 
            onClick={handleBackToIdeas}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md"
          >
            Back to Ideas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen max-h-screen">
      <header className="bg-white border-b border-gray-200 p-4">
        <ProgressStepper currentStage={currentStage} progress={progress} />
        {isReadOnly && (
          <div className="mt-2 text-amber-600 text-sm font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Read-only mode: This stage has been completed
          </div>
        )}
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Chat area */}
        <div className="flex-1 flex flex-col max-h-full overflow-hidden">
          <div className="bg-blue-50 p-4 border-b border-blue-100">
            <div className="flex items-center">
              <div className="bg-blue-500 h-10 w-10 rounded-full flex items-center justify-center text-white font-bold">
                {persona.name.substring(0, 1)}
              </div>
              <div className="ml-3">
                <div className="font-semibold">{persona.name}</div>
                <div className="text-sm text-gray-600">{persona.role}</div>
              </div>
            </div>
          </div>
          
          {stageId && (
            <ChatWindow 
              stageId={stageId} 
              persona={persona}
              onStageComplete={handleStageComplete}
              isReadOnly={isReadOnly}
            />
          )}
        </div>
        
        {/* Sidebar */}
        <div className="w-80 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto">
          <h3 className="font-bold text-lg mb-2">Goal</h3>
          <p className="text-gray-700 mb-6">{persona.goal}</p>
          
          <h3 className="font-bold text-lg mb-2">Conversation Tips</h3>
          <ul className="list-disc pl-5 space-y-2">
            {persona.tips.map((tip, index) => (
              <li key={index} className="text-gray-700">{tip}</li>
            ))}
          </ul>

          {initialIdea && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-lg mb-2">Your Idea</h3>
              <h4 className="font-semibold">{initialIdea.title}</h4>
              <p className="text-sm text-gray-700 mt-1">{initialIdea.rawIdea}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 