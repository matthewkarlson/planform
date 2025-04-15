'use client';

import { use, useState } from 'react';
import React from 'react';
import { Button } from '../../../components/ui/button';
import { AlertCircle, Loader2, Zap, Star, Gauge, Download } from 'lucide-react';
import { useUser } from '../../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Type definitions for the analysis response
type Ratings = {
  marketPotential: number;
  feasibility: number;
  innovation: number;
  competitiveness: number;
  profitPotential: number;
}

type Feedback = {
  ratings: Ratings;
  personalOpinion: string;
  likes: string[];
  dislikes: string[];
  suggestions: string[];
  overallSummary: string;
}

type Analysis = {
  persona: string;
  feedback?: Feedback;
  error?: boolean;
  message?: string;
}

type AnalysisResult = {
  executiveSummary?: string;
  ideaSummary?: string;
  competitorAnalysis?: string;
  competitorAnalysisAnnotations?: any[];
  marketSaturationScore?: number;
  analyses: Analysis[];
  overallScores: Ratings;
  overallScore: number;
  remainingRuns: number;
  refusal?: {
    text: string;
  };
  additionalDetails?: {
    coreProblem?: string;
    uniqueValue?: string;
    revenueStrategy?: string;
  };
}

export default function ArenaPage() {
  const { userPromise } = useUser();
  const user = use(userPromise);
  const router = useRouter();
  
  const [ideaName, setIdeaName] = useState('');
  const [ideaDescription, setIdeaDescription] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [coreProblem, setCoreProblem] = useState('');
  const [revenueStrategy, setRevenueStrategy] = useState('');
  const [uniqueValue, setUniqueValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState<AnalysisResult | null>(null);
  
  const hasRemainingRuns = user && user.remainingRuns && user.remainingRuns > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ideaName.trim() || !ideaDescription.trim()) {
      setError('Please fill in the idea name and description');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError('');
      
      const response = await fetch('/api/arena/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideaName,
          ideaDescription,
          targetAudience,
          coreProblem,
          revenueStrategy,
          uniqueValue,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      setResults(data);
      
      // Update the UI to show the user's updated remaining runs
      if (user) {
        user.remainingRuns = data.remainingRuns;
      }
      
    } catch (err) {
      console.error('Error submitting idea:', err);
      setError(err instanceof Error ? err.message : 'Failed to analyze idea');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to render rating stars
  const renderRatingStars = (rating: number) => {
    return (
      <div className="flex items-center">
        <div className="flex space-x-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
            <Star 
              key={star} 
              className={`h-4 w-4 ${star <= rating ? "text-orange-500 fill-orange-500" : "text-gray-300"}`} 
            />
          ))}
        </div>
        <span className="ml-2 text-sm font-medium">{rating}/10</span>
      </div>
    );
  };

  // Function to export analysis as markdown
  const exportAsMarkdown = () => {
    if (!results) return;
    
    const fileName = `${ideaName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_analysis.md`;
    
    let markdownContent = `# ${ideaName} - Idea Analysis\n\n`;
    markdownContent += `_Target Audience: ${targetAudience || 'Not specified'}_\n\n`;
    
    // Add core details section
    markdownContent += `## Idea Details\n\n`;
    if (coreProblem) markdownContent += `**Core Problem:** ${coreProblem}\n\n`;
    if (uniqueValue) markdownContent += `**Unique Value:** ${uniqueValue}\n\n`;
    if (revenueStrategy) markdownContent += `**Revenue Strategy:** ${revenueStrategy}\n\n`;
    
    markdownContent += `**Overall Score: ${results.overallScore}/100**\n\n`;
    
    // Add executive summary
    if (results.executiveSummary) {
      markdownContent += results.executiveSummary + '\n\n';
    } else if (results.ideaSummary) {
      markdownContent += `## Idea Summary\n\n${results.ideaSummary}\n\n`;
    }
    
    // Add overall ratings
    markdownContent += `## Overall Ratings\n\n`;
    markdownContent += `- Market Potential: ${results.overallScores.marketPotential}/10\n`;
    markdownContent += `- Feasibility: ${results.overallScores.feasibility}/10\n`;
    markdownContent += `- Innovation: ${results.overallScores.innovation}/10\n`;
    markdownContent += `- Competitiveness: ${results.overallScores.competitiveness}/10\n`;
    markdownContent += `- Profit Potential: ${results.overallScores.profitPotential}/10\n\n`;
    
    // Add competitor analysis
    if (results.competitorAnalysis) {
      markdownContent += `# Competitor Analysis\n\n`;
      markdownContent += `_Market Saturation Score: ${results.marketSaturationScore || 50}/100_\n\n`;
      markdownContent += results.competitorAnalysis + '\n\n';
    }
    
    // Add expert feedback
    markdownContent += `# Expert Feedback\n\n`;
    
    results.analyses.forEach(analysis => {
      if (analysis.error || !analysis.feedback) return;
      
      markdownContent += `## ${analysis.persona}\n\n`;
      markdownContent += `"${analysis.feedback.overallSummary}"\n\n`;
      
      markdownContent += `### Personal Reaction\n\n`;
      markdownContent += `${analysis.feedback.personalOpinion}\n\n`;
      
      markdownContent += `### Ratings\n\n`;
      markdownContent += `- Market Potential: ${analysis.feedback.ratings.marketPotential}/10\n`;
      markdownContent += `- Feasibility: ${analysis.feedback.ratings.feasibility}/10\n`;
      markdownContent += `- Innovation: ${analysis.feedback.ratings.innovation}/10\n`;
      markdownContent += `- Competitiveness: ${analysis.feedback.ratings.competitiveness}/10\n`;
      markdownContent += `- Profit Potential: ${analysis.feedback.ratings.profitPotential}/10\n\n`;
      
      markdownContent += `### What I Like\n\n`;
      analysis.feedback.likes.forEach(like => {
        markdownContent += `- ${like}\n`;
      });
      markdownContent += '\n';
      
      markdownContent += `### What I Dislike\n\n`;
      analysis.feedback.dislikes.forEach(dislike => {
        markdownContent += `- ${dislike}\n`;
      });
      markdownContent += '\n';
      
      markdownContent += `### My Suggestions\n\n`;
      analysis.feedback.suggestions.forEach(suggestion => {
        markdownContent += `- ${suggestion}\n`;
      });
      markdownContent += '\n';
    });
    
    // Append date
    markdownContent += `_Generated on ${new Date().toLocaleDateString()}_`;
    
    // Create and download the file
    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Check if there was a model refusal
  const hasRefusal = results && results.refusal;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {error && (
        <div className="relative w-full rounded-lg border border-red-600 bg-red-50 p-4 mb-6 text-red-600">
          <AlertCircle className="absolute left-4 top-4 h-4 w-4" />
          <div className="pl-7">
            <h5 className="mb-1 font-medium leading-none tracking-tight">Error</h5>
            <div className="text-sm">{error}</div>
          </div>
        </div>
      )}
      
      {hasRefusal && (
        <div className="relative w-full rounded-lg border border-amber-600 bg-amber-50 p-4 mb-6 text-amber-700">
          <AlertCircle className="absolute left-4 top-4 h-4 w-4" />
          <div className="pl-7">
            <h5 className="mb-1 font-medium leading-none tracking-tight">Request Refused</h5>
            <div className="text-sm">{results?.refusal?.text}</div>
          </div>
        </div>
      )}
      
      {!hasRemainingRuns && (
        <div className="relative w-full rounded-lg border border-red-600 bg-red-50 p-4 mb-6 text-red-600">
          <AlertCircle className="absolute left-4 top-4 h-4 w-4" />
          <div className="pl-7">
            <h5 className="mb-1 font-medium leading-none tracking-tight">No Remaining Runs</h5>
            <div className="text-sm">
              You don't have any remaining idea runs. Please purchase more runs from the 
              <a href="/pricing" className="font-medium underline ml-1">pricing page</a>.
            </div>
          </div>
        </div>
      )}
      
      {!results ? (
        <Card className="shadow-md bg-white">
          <CardHeader className="pb-4 border-b">
            <CardTitle className="text-3xl font-bold text-center text-gray-900">
              Idea Arena
              <div className="text-base font-normal text-muted-foreground mt-1">
                Test your ideas against real AI agents
              </div>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pt-6">
            <div className="grid gap-8">
              {hasRemainingRuns ? (
                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="idea-name" className="text-base">Idea Name</Label>
                      <Input
                        id="idea-name"
                        placeholder="Enter a name for your idea"
                        className="bg-white"
                        value={ideaName}
                        onChange={(e) => setIdeaName(e.target.value)}
                        disabled={isSubmitting}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="target-audience" className="text-base">Target Audience</Label>
                      <Input
                        id="target-audience"
                        placeholder="Who would use this idea?"
                        className="bg-white"
                        value={targetAudience}
                        onChange={(e) => setTargetAudience(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="idea-description" className="text-base">Describe Your Idea</Label>
                    <textarea
                      id="idea-description"
                      rows={4}
                      placeholder="What problem does it solve? Who is it for? How does it work?"
                      className="flex w-full rounded-md border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-2"
                      value={ideaDescription}
                      onChange={(e) => setIdeaDescription(e.target.value)}
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="core-problem" className="text-base">Core Problem</Label>
                    <textarea
                      id="core-problem"
                      rows={2}
                      placeholder="What specific problem or pain point does your idea solve?"
                      className="flex w-full rounded-md border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-2"
                      value={coreProblem}
                      onChange={(e) => setCoreProblem(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="unique-value" className="text-base">Unique Value Proposition</Label>
                    <textarea
                      id="unique-value"
                      rows={2}
                      placeholder="What makes your solution unique? Why would users choose it over alternatives?"
                      className="flex w-full rounded-md border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-2"
                      value={uniqueValue}
                      onChange={(e) => setUniqueValue(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="revenue-strategy" className="text-base">Revenue Strategy</Label>
                    <textarea
                      id="revenue-strategy"
                      rows={2}
                      placeholder="How will this idea generate revenue? (e.g., subscription, one-time payment, freemium, ads)"
                      className="flex w-full rounded-md border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-2"
                      value={revenueStrategy}
                      onChange={(e) => setRevenueStrategy(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-orange-100 rounded-full p-2">
                        <Zap className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Remaining Runs</p>
                        <p className="text-lg font-bold">{user?.remainingRuns || 0}</p>
                      </div>
                    </div>
                  
                    <Button 
                      type="submit"
                      size="lg" 
                      className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          Test My Idea <Zap className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="py-16 text-center">
                  <div className="inline-flex mx-auto items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                    <Zap className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Purchase More Runs
                  </h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-6">
                    You need at least one run to test your ideas. Get more runs to unlock our AI-powered analysis.
                  </p>
                  <Button 
                    asChild
                    size="lg" 
                    className="bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    <a href="/pricing">View Pricing Plans</a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : hasRefusal ? (
        <div className="space-y-6 text-center">
          <Card className="shadow-md bg-white p-8">
            <h2 className="text-2xl font-bold mb-4">Unable to Analyze Idea</h2>
            <p className="text-gray-700 mb-8">
              We weren't able to analyze this idea. Please try a different idea or modify your description.
            </p>
            <Button
              onClick={() => setResults(null)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Try Another Idea
            </Button>
          </Card>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Executive/Idea Summary Card */}
          <Card className="shadow-md bg-white">
            <CardHeader className="pb-4 border-b bg-gradient-to-r from-orange-50 to-white">
              <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
                <span>{results.executiveSummary ? 'Executive Summary' : 'Idea Summary'}</span>
                <div className="flex items-center bg-white px-3 py-1 rounded-lg shadow-sm space-x-2">
                  <div className="text-2xl font-bold text-gray-900">{results.overallScore}</div>
                  <div className="text-xs font-medium text-gray-500">SCORE</div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 px-6">
              {/* Score Gauge */}
              <div className="max-w-sm mx-auto mb-8">
                <div className="relative w-48 h-48 mx-auto">
                  <svg className="w-full h-full" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke="#e5e7eb" 
                      strokeWidth="10" 
                    />
                    
                    {/* Score gauge */}
                    <circle 
                      cx="50" 
                      cy="50" 
                      r="45" 
                      fill="none" 
                      stroke={
                        results.overallScore >= 80 ? "#10b981" : // green for high scores
                        results.overallScore >= 60 ? "#f59e0b" : // amber for medium scores
                        "#ef4444" // red for low scores
                      } 
                      strokeWidth="10" 
                      strokeDasharray="282.7"
                      strokeDashoffset={282.7 - (282.7 * results.overallScore / 100)}
                      strokeLinecap="round"
                      transform="rotate(-90 50 50)"
                    />
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="text-5xl font-bold text-gray-900">{results.overallScore}</div>
                    <div className="text-sm font-medium text-gray-500">Overall Score</div>
                  </div>
                </div>
                
                <div className="mt-4 text-center">
                  <div className={`text-lg font-semibold ${
                    results.overallScore >= 80 ? "text-green-600" : 
                    results.overallScore >= 60 ? "text-amber-600" : 
                    "text-red-600"
                  }`}>
                    {results.overallScore >= 80 ? "Excellent Potential" : 
                     results.overallScore >= 60 ? "Good Potential" : 
                     "Needs Improvement"}
                  </div>
                </div>
              </div>

              {/* Executive Summary */}
              <div className="prose prose-gray prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-1 prose-h2:border-b prose-h2:border-gray-200 prose-h3:text-lg prose-h3:font-medium prose-h3:mt-5 prose-h3:mb-2 prose-p:text-base prose-p:leading-relaxed prose-p:my-4 prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-2 prose-li:pl-1 prose-strong:font-semibold prose-strong:text-gray-800 prose-a:text-blue-600 prose-a:underline max-w-none">
                {results.executiveSummary ? (
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-6 mb-3 pb-1 border-b border-gray-200" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-5 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="text-base leading-relaxed my-4" {...props} />,
                      ul: ({node, ...props}) => <ul className="my-4 list-disc pl-6" {...props} />,
                      ol: ({node, ...props}) => <ol className="my-4 list-decimal pl-6" {...props} />,
                      li: ({node, ...props}) => <li className="my-2 pl-1" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-600 underline" target="_blank" rel="noopener noreferrer" {...props} />
                    }}
                  >
                    {results.executiveSummary}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-700">{results.ideaSummary}</p>
                )}
              </div>
              
              {/* Additional Details Section (if provided) */}
              {results.additionalDetails && (
                Object.values(results.additionalDetails).some(val => val) && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="text-lg font-medium mb-4">Idea Details</h3>
                    <div className="grid grid-cols-1 gap-4">
                      {results.additionalDetails.coreProblem && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Core Problem</p>
                          <p className="text-base text-gray-800">{results.additionalDetails.coreProblem}</p>
                        </div>
                      )}
                      {results.additionalDetails.uniqueValue && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Unique Value Proposition</p>
                          <p className="text-base text-gray-800">{results.additionalDetails.uniqueValue}</p>
                        </div>
                      )}
                      {results.additionalDetails.revenueStrategy && (
                        <div>
                          <p className="text-sm font-medium text-gray-600 mb-1">Revenue Strategy</p>
                          <p className="text-base text-gray-800">{results.additionalDetails.revenueStrategy}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}
              
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-lg font-medium mb-4">Overall Ratings</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Market Potential</p>
                    {renderRatingStars(results.overallScores.marketPotential)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Feasibility</p>
                    {renderRatingStars(results.overallScores.feasibility)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Innovation</p>
                    {renderRatingStars(results.overallScores.innovation)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Competitiveness</p>
                    {renderRatingStars(results.overallScores.competitiveness)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Profit Potential</p>
                    {renderRatingStars(results.overallScores.profitPotential)}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-3">
                  <div className="bg-orange-100 rounded-full p-2">
                    <Zap className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Remaining Runs</p>
                    <p className="text-lg font-bold">{results.remainingRuns}</p>
                  </div>
                </div>
              
                <div className="flex gap-2">
                  <Button 
                    onClick={exportAsMarkdown}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                  >
                    <Download className="h-4 w-4" />
                    Export as Markdown
                  </Button>
                
                  <Button 
                    onClick={() => setResults(null)}
                    variant="outline"
                    size="sm" 
                  >
                    Try Another Idea
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Competitor Analysis Card */}
          {results.competitorAnalysis && (
            <Card className="shadow-md bg-white mt-8">
              <CardHeader className="pb-4 border-b bg-gradient-to-r from-blue-50 to-white">
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center justify-between">
                  <span>Competitor Analysis</span>
                  <div className="flex items-center bg-white px-3 py-1 rounded-lg shadow-sm space-x-2">
                    <div className="text-2xl font-bold text-gray-900">{results.marketSaturationScore || 50}</div>
                    <div className="text-xs font-medium text-gray-500">MARKET</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 px-6">
                {/* Market Saturation Gauge */}
                <div className="max-w-sm mx-auto mb-8">
                  <div className="relative w-48 h-48 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke="#e5e7eb" 
                        strokeWidth="10" 
                      />
                      
                      {/* Score gauge */}
                      <circle 
                        cx="50" 
                        cy="50" 
                        r="45" 
                        fill="none" 
                        stroke={
                          (results.marketSaturationScore || 50) <= 30 ? "#10b981" : // green for low saturation (good)
                          (results.marketSaturationScore || 50) <= 70 ? "#f59e0b" : // amber for medium saturation
                          "#ef4444" // red for high saturation (challenging)
                        } 
                        strokeWidth="10" 
                        strokeDasharray="282.7"
                        strokeDashoffset={282.7 - (282.7 * (results.marketSaturationScore || 50) / 100)}
                        strokeLinecap="round"
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div className="text-5xl font-bold text-gray-900">{results.marketSaturationScore || 50}</div>
                      <div className="text-sm font-medium text-gray-500">Market Saturation</div>
                    </div>
                  </div>
                  
                  <div className="mt-4 text-center">
                    <div className={`text-lg font-semibold ${
                      (results.marketSaturationScore || 50) <= 30 ? "text-green-600" : 
                      (results.marketSaturationScore || 50) <= 70 ? "text-amber-600" : 
                      "text-red-600"
                    }`}>
                      {(results.marketSaturationScore || 50) <= 30 ? "Low Competition" : 
                       (results.marketSaturationScore || 50) <= 70 ? "Moderate Competition" : 
                       "Highly Competitive Market"}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {(results.marketSaturationScore || 50) <= 30 
                        ? "Great opportunity with few competitors" 
                        : (results.marketSaturationScore || 50) <= 70 
                          ? "Some established competitors, but room for innovation" 
                          : "Crowded market requiring strong differentiation"}
                    </p>
                  </div>
                </div>

                {/* Competitor Analysis Content */}
                <div className="prose prose-gray prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4 prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3 prose-h2:pb-1 prose-h2:border-b prose-h2:border-gray-200 prose-h3:text-lg prose-h3:font-medium prose-h3:mt-5 prose-h3:mb-2 prose-p:text-base prose-p:leading-relaxed prose-p:my-4 prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6 prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-2 prose-li:pl-1 prose-strong:font-semibold prose-strong:text-gray-800 prose-a:text-blue-600 prose-a:underline max-w-none">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-2xl font-bold mb-4" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-xl font-semibold mt-6 mb-3 pb-1 border-b border-gray-200" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-lg font-medium mt-5 mb-2" {...props} />,
                      p: ({node, ...props}) => <p className="text-base leading-relaxed my-4" {...props} />,
                      ul: ({node, ...props}) => <ul className="my-4 list-disc pl-6" {...props} />,
                      ol: ({node, ...props}) => <ol className="my-4 list-decimal pl-6" {...props} />,
                      li: ({node, ...props}) => <li className="my-2 pl-1" {...props} />,
                      a: ({node, ...props}) => <a className="text-blue-600 underline" target="_blank" rel="noopener noreferrer" {...props} />
                    }}
                  >
                    {results.competitorAnalysis || ''}
                  </ReactMarkdown>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Expert Feedback */}
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Feedback from Arena Experts</h2>
          
          <div className="grid gap-6 md:grid-cols-2">
            {results.analyses.map((analysis, index) => (
              <Card key={index} className="shadow-sm">
                <CardHeader className="py-3 px-4 bg-gray-50 border-b">
                  <CardTitle className="text-lg font-medium">{analysis.persona}</CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  {analysis.error ? (
                    <div className="text-red-500">
                      {analysis.message || 'Analysis could not be completed for this persona.'}
                    </div>
                  ) : analysis.feedback ? (
                    <div className="space-y-4">
                      {/* Overall summary */}
                      <p className="text-gray-700">{analysis.feedback.overallSummary}</p>
                      
                      {/* Personal Opinion */}
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Personal Reaction</h4>
                        <p className="text-sm text-gray-700 italic">{analysis.feedback.personalOpinion}</p>
                      </div>
                      
                      {/* Ratings */}
                      <div className="space-y-2 pt-2 pb-1">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs font-medium text-gray-500">Market</p>
                            {renderRatingStars(analysis.feedback.ratings.marketPotential)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Feasibility</p>
                            {renderRatingStars(analysis.feedback.ratings.feasibility)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Innovation</p>
                            {renderRatingStars(analysis.feedback.ratings.innovation)}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-gray-500">Competitiveness</p>
                            {renderRatingStars(analysis.feedback.ratings.competitiveness)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Likes */}
                      <div>
                        <h4 className="text-sm font-semibold mb-1">What I Like</h4>
                        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                          {analysis.feedback.likes.map((like, i) => (
                            <li key={i}>{like}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Dislikes */}
                      <div>
                        <h4 className="text-sm font-semibold mb-1">What I Dislike</h4>
                        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                          {analysis.feedback.dislikes.map((dislike, i) => (
                            <li key={i}>{dislike}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Suggestions */}
                      <div>
                        <h4 className="text-sm font-semibold mb-1">My Suggestions</h4>
                        <ul className="list-disc ml-5 text-sm text-gray-700 space-y-1">
                          {analysis.feedback.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <Button
              onClick={() => router.push('/dashboard')}
              className="mr-4"
              variant="outline"
            >
              Go to Dashboard
            </Button>
            <Button
              onClick={exportAsMarkdown}
              className="mr-4 bg-blue-500 hover:bg-blue-600 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Save as Markdown
            </Button>
            <Button
              onClick={() => setResults(null)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              Test Another Idea
            </Button>
          </div>
        </div>
      )}
    </div>
  );
} 