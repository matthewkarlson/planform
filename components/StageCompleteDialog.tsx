'use client';

import { useState } from 'react';

interface StageCompleteDialogProps {
  personaName: string;
  onContinue: () => void;
}

export default function StageCompleteDialog({ personaName, onContinue }: StageCompleteDialogProps) {
  const [isOpen, setIsOpen] = useState(true);

  const handleContinue = () => {
    setIsOpen(false);
    onContinue();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <h3 className="mt-4 text-lg font-medium text-gray-900">
            Conversation with {personaName} Complete!
          </h3>
          
          <p className="mt-2 text-sm text-gray-500">
            You've successfully completed this stage. Ready to move on to the next step?
          </p>
          
          <div className="mt-5">
            <button
              type="button"
              onClick={handleContinue}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 