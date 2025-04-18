'use client';

import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { ReactNode } from 'react';
import type { Components } from 'react-markdown';

// Client component for export button
function ExportButton() {
  const handleExport = () => {
    window.print();
  };
  
  return (
    <button
      onClick={handleExport}
      className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
    >
      Export Summary
    </button>
  );
}

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

interface SummaryClientProps {
  idea: {
    id: string;
    title: string | null;
    rawIdea: string | null;
    createdAt: Date | null;
  };
  ideaId: string;
  stageMap: Record<string, StageSummary>;
  overallScore: number | null;
  completedStageCount: number;
}

export default function SummaryClient({ 
  idea, 
  ideaId,
  stageMap, 
  overallScore, 
  completedStageCount,
}: SummaryClientProps) {
  // Markdown components configuration
  const markdownComponents: Components = {
    h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-3 mt-4" {...props} />,
    h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-2 mt-4" {...props} />,
    h3: ({ node, ...props }) => <h3 className="text-lg font-medium mb-2 mt-3" {...props} />,
    p: ({ node, ...props }) => <p className="mb-3 text-gray-700" {...props} />,
    ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
    ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
    li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
    blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-gray-300 pl-4 italic my-3 text-gray-600" {...props} />,
    code: ({ node, className, ...props }) => {
      // Check if this is an inline code block
      const isInline = !className || !className.includes('language-');
      return <code className={`${isInline ? 'bg-gray-100 px-1 py-0.5 rounded text-sm' : ''} ${className || ''}`} {...props} />;
    },
    pre: ({ node, ...props }) => <pre className="bg-gray-100 p-3 rounded-md my-3 overflow-x-auto text-sm" {...props} />,
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold mb-2">{idea.title}</h1>
              <p className="text-gray-600 mb-2">{idea.rawIdea}</p>
              <div className="text-sm text-gray-500">
                Created on {new Date(idea.createdAt!).toLocaleDateString()}
              </div>
            </div>
            <Link
              href="/arena"
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
            >
              ← Back to Arena
            </Link>
          </div>
        </header>

        {overallScore !== null && (
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 mb-10">
            <div className="flex items-center mb-4">
              <div className="text-5xl mr-4">{getScoreEmoji(overallScore)}</div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Overall Score: {overallScore}/10</h2>
                <p className="text-gray-700">
                  Based on {completedStageCount} completed stages
                </p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-blue-600 h-2.5 rounded-full" 
                style={{ width: `${overallScore * 10}%` }}
              ></div>
            </div>
          </div>
        )}

        <h2 className="text-2xl font-semibold mb-6">Stage Insights</h2>

        <div className="space-y-6">
          {Object.entries(stageMap).map(([key, stage]) => (
            <div 
              key={key}
              className={`border rounded-lg overflow-hidden ${
                stage.completed 
                  ? 'border-green-200 bg-white' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex justify-between items-center p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">{stage.icon}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{stage.name}</h3>
                    {stage.score !== null && (
                      <div className="text-sm text-gray-600">
                        Score: {stage.score}/10 {getScoreEmoji(stage.score)}
                      </div>
                    )}
                  </div>
                </div>
                {stage.completed ? (
                  <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Completed
                  </div>
                ) : (
                  <Link
                    href={`/ideas/${ideaId}/${key}`}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Start this stage →
                  </Link>
                )}
              </div>

              {stage.completed && stage.summary && (
                <div className="p-4">
                  <ReactMarkdown components={markdownComponents}>
                    {stage.summary}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-between">
          <Link
            href="/arena"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            ← Back to Arena
          </Link>
          
          <ExportButton />
        </div>
      </div>
    </div>
  );
} 