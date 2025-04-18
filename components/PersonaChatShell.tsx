'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ChatWindow from '@/components/ChatWindow';
import ProgressStepper from '@/components/ProgressStepper';

export interface Persona {
  name: string;
  role: string;
  goal: string;
  avatarUrl: string;
  tips: string[];
  initialMessage: string;
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
    initialMessage: 'Hey! I\'m Jordan, tell me how your product will help me',
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
    initialMessage: 'Hey! I\'m Ava, tell me how your product will help me',
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
    initialMessage: 'Hey! I\'m Zeke, tell me how your product will help me',
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
    initialMessage: 'Hey! I\'m Morgan, tell me how your product will help me',
  },
};

// The stages in order
const stages = ['customer', 'designer', 'marketer', 'vc'];

export default function PersonaChatShell() {
  const params = useParams();
  const router = useRouter();
  const [ideaDetails, setIdeaDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [stageId, setStageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const currentStage = typeof params.stage === 'string' ? params.stage : '';
  const ideaId = typeof params.id === 'string' ? params.id : '';
  
  const persona = personaMap[currentStage] || personaMap.customer;
  const stageIndex = stages.indexOf(currentStage);
  const progress = ((stageIndex + 1) / stages.length) * 100;

  // Fetch idea details first
  useEffect(() => {
    if (!ideaId) return;

    const fetchIdeaDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // This endpoint needs to be implemented to get an idea by id
        const response = await fetch(`/api/ideas/${ideaId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch idea details');
        }
        
        const data = await response.json();
        console.log('Loaded idea details:', data);
        setIdeaDetails(data);
      } catch (error) {
        console.error('Error fetching idea details:', error);
        setError('Failed to load idea details. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchIdeaDetails();
  }, [ideaId]);

  // Only check for existing stage after idea details are loaded
  useEffect(() => {
    if (!ideaId || !currentStage || isLoading || !ideaDetails) return;
    let isComponentMounted = true;

    // Check if a stage already exists for this idea and stage name
    const getExistingStage = async () => {
      try {
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
  }, [ideaId, currentStage, ideaDetails]);

  const handleStageComplete = async () => {
    console.log('Continue button clicked, stageId:', stageId);
    
    if (!stageId) {
      console.log('No stageId found, navigating to next stage');
      // Find the next stage and navigate to it
      const currentIndex = stages.indexOf(currentStage);
      const nextStage = currentIndex < stages.length - 1 ? stages[currentIndex + 1] : null;
      
      if (nextStage) {
        router.push(`/ideas/${ideaId}/${nextStage}`);
      } else {
        router.push(`/ideas/${ideaId}/summary`);
      }
      return;
    }
    
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

  // Handle navigation back to ideas list
  const handleBackToIdeas = () => {
    router.push('/ideas');
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

          {ideaDetails && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-bold text-lg mb-2">Your Idea</h3>
              <h4 className="font-semibold">{ideaDetails.title}</h4>
              <p className="text-sm text-gray-700 mt-1">{ideaDetails.rawIdea}</p>
              <button
                onClick={handleStageComplete}
                className="w-full mt-6 py-3 bg-blue-600 text-white text-lg rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 border-2 border-blue-400 shadow-lg transition-all"
              >
                Continue →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 