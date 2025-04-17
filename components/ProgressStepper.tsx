'use client';

import Link from 'next/link';

interface ProgressStepperProps {
  currentStage: string;
  progress: number;
}

interface StepInfo {
  id: string;
  label: string;
  icon: string;
}

// Define the steps for the progress stepper
const steps: StepInfo[] = [
  {
    id: 'customer',
    label: 'Customer',
    icon: '👤',
  },
  {
    id: 'designer',
    label: 'Designer',
    icon: '🎨',
  },
  {
    id: 'marketer',
    label: 'Marketer',
    icon: '📊',
  },
  {
    id: 'vc',
    label: 'VC',
    icon: '💰',
  },
  {
    id: 'summary',
    label: 'Summary',
    icon: '📋',
  },
];

export default function ProgressStepper({ currentStage, progress }: ProgressStepperProps) {
  // Find the index of the current stage
  const currentIndex = steps.findIndex((step) => step.id === currentStage);
  
  return (
    <div className="w-full">
      <div className="mb-2 flex justify-between">
        <h2 className="text-lg font-semibold">Idea Development Pipeline</h2>
        <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
      </div>
      
      <div className="relative">
        {/* Progress bar */}
        <div className="h-1 w-full bg-gray-200 rounded-full">
          <div
            className="h-1 bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        
        {/* Steps */}
        <div className="flex justify-between items-center -mt-2">
          {steps.map((step, index) => {
            const isActive = index <= currentIndex;
            const isPassed = index < currentIndex;
            
            return (
              <div
                key={step.id}
                className="flex flex-col items-center"
              >
                <div
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs
                    ${isPassed ? 'bg-blue-600 text-white' : isActive ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}
                  `}
                >
                  {isPassed ? '✓' : step.icon}
                </div>
                <span className={`text-xs mt-1 ${isActive ? 'font-medium' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 