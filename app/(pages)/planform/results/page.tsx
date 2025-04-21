'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Printer, Download, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

type ServiceRecommendation = {
  serviceId: string;
  reason: string;
};

type ServiceData = {
  id: number;
  serviceId: string;
  name: string;
  description: string;
  outcomes: string[];
  priceLower: number | null;
  priceUpper: number | null;
  whenToRecommend: string[];
};

type AnalysisResponse = {
  clientResponses: Record<string, string | string[]>;
  recommendations: ServiceRecommendation[];
  totalEstimatedCost: {
    minTotal: number;
    maxTotal: number;
    formattedRange: string;
  };
};

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const recommendationId = searchParams.get('id');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [services, setServices] = useState<Record<string, ServiceData>>({});
  const [clientName, setClientName] = useState<string>('');

  // Fetch the analysis results
  useEffect(() => {
    if (!recommendationId) {
      setError('No recommendation ID provided');
      setLoading(false);
      return;
    }

    async function fetchResults() {
      try {
        // In a real app, this would fetch from a database using the ID
        // For this demo, we'll simulate retrieving the data from localStorage
        const storedAnalysis = localStorage.getItem(`planform_analysis_${recommendationId}`);
        
        if (!storedAnalysis) {
          setError('Recommendation not found');
          setLoading(false);
          return;
        }
        
        const parsedAnalysis = JSON.parse(storedAnalysis) as AnalysisResponse;
        setAnalysis(parsedAnalysis);
        
        // Fetch all services to get the full details
        const response = await fetch('/api/planform/services');
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        
        const allServices = await response.json();
        const servicesMap: Record<string, ServiceData> = {};
        
        for (const service of allServices) {
          servicesMap[service.serviceId] = service;
        }
        
        setServices(servicesMap);
        
        // Set client name if available
        if (parsedAnalysis.clientResponses && parsedAnalysis.clientResponses.name) {
          setClientName(parsedAnalysis.clientResponses.name as string);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching results:', err);
        setError('Failed to load results');
        setLoading(false);
      }
    }

    fetchResults();
  }, [recommendationId]);

  const printPage = () => {
    window.print();
  };

  const downloadPDF = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold">Loading your custom plan...</h1>
        <p className="mt-4">Please wait while we prepare your results.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold text-red-600">Error</h1>
        <p className="mt-4">{error}</p>
        <Link href="/planform">
          <Button className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Questionnaire
          </Button>
        </Link>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold">No Results Found</h1>
        <p className="mt-4">We couldn't find any results for this recommendation.</p>
        <Link href="/planform">
          <Button className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return to Questionnaire
          </Button>
        </Link>
      </div>
    );
  }

  // Determine client's primary goal
  const primaryGoal = analysis.clientResponses.primaryGoal as string || '';
  const businessType = analysis.clientResponses.businessType as string || '';
  
  return (
    <div className="container mx-auto py-12 max-w-4xl">
      {/* Print controls - will be hidden when printing */}
      <div className="print:hidden flex justify-between mb-8">
        <Link href="/planform">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Questionnaire
          </Button>
        </Link>
        <div className="space-x-2">
          <Button onClick={printPage} variant="outline">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={downloadPDF}>
            <Download className="mr-2 h-4 w-4" />
            Save as PDF
          </Button>
        </div>
      </div>

      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Your Custom Growth Plan</h1>
        <p className="text-xl text-gray-600">
          {clientName ? `Prepared exclusively for ${clientName}` : 'Prepared exclusively for you'}
        </p>
        <p className="text-md text-gray-500 mt-2">
          By Planform.ai
        </p>
      </div>

      {/* Executive Summary */}
      <Card className="mb-12">
        <CardHeader>
          <CardTitle className="text-2xl">Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-700">
            Based on your responses, we've crafted a tailored digital strategy that addresses your specific needs
            {businessType && ` as a ${businessType} business`}{primaryGoal && `, with a focus on ${primaryGoal.replace(/_/g, ' ')}`}.
            Our recommended approach includes {analysis.recommendations.length} key services designed to work together to achieve your goals.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <p className="font-medium text-lg">Estimated Investment Range:</p>
            <p className="text-2xl font-bold text-primary">{analysis.totalEstimatedCost.formattedRange}</p>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Services */}
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Recommended Services</h2>
      
      {analysis.recommendations.map((recommendation, index) => {
        const service = services[recommendation.serviceId];
        if (!service) return null;
        
        return (
          <Card key={index} className="mb-8">
            <CardHeader>
              <CardTitle className="text-2xl">{service.name}</CardTitle>
              <div className="text-gray-500 mt-1">
                {service.priceLower && service.priceUpper ? 
                  `$${service.priceLower.toLocaleString()} - $${service.priceUpper.toLocaleString()}` : 
                  'Price upon request'}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2 text-gray-800">Service Description</h4>
                  <p className="text-gray-700">{service.description}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-gray-800">Why This Is Right For You</h4>
                  <p className="text-gray-700">{recommendation.reason}</p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2 text-gray-800">Expected Outcomes</h4>
                  <ul className="list-disc pl-5 text-gray-700 space-y-1">
                    {service.outcomes.map((outcome, i) => (
                      <li key={i}>{outcome}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {/* Implementation Plan */}
      <h2 className="text-3xl font-bold text-gray-900 mb-6">Implementation Plan</h2>
      <Card className="mb-12">
        <CardContent className="pt-6">
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Phase 1: Discovery & Strategy (Weeks 1-2)</h3>
              <p className="text-gray-700 mb-2">
                We'll begin with a comprehensive analysis of your current position and goals:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Detailed kickoff meeting to align on objectives and expectations</li>
                <li>Thorough audit of your current digital presence and performance</li>
                <li>Competitive analysis to identify opportunities and threats</li>
                <li>Development of strategic roadmap with clear milestones and KPIs</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Phase 2: Design & Development (Weeks 3-8)</h3>
              <p className="text-gray-700 mb-2">
                With strategy in place, we'll move to creating and implementing the core assets:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Creation of brand assets and design systems as needed</li>
                <li>Development of digital infrastructure and technology implementations</li>
                <li>Content creation and optimization for your target audience</li>
                <li>Setting up tracking and measurement frameworks</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Phase 3: Launch & Optimization (Weeks 9-12)</h3>
              <p className="text-gray-700 mb-2">
                Getting your improved digital presence live and optimizing for results:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Coordinated launch of new assets and campaigns</li>
                <li>Real-time monitoring and performance analysis</li>
                <li>A/B testing and iterative improvements</li>
                <li>Regular reporting and strategy refinement</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-3">Ongoing Partnership</h3>
              <p className="text-gray-700">
                Our relationship doesn't end with the initial implementation. We'll continue to support your growth through:
              </p>
              <ul className="list-disc pl-5 text-gray-700 space-y-1">
                <li>Monthly performance reviews and strategy sessions</li>
                <li>Quarterly deep-dive analysis and planning</li>
                <li>Continuous optimization based on market trends and results</li>
                <li>Proactive identification of new opportunities</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl">Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-700">
            Ready to transform your digital presence? Here's how to get started:
          </p>
          <ol className="list-decimal pl-5 text-gray-700 space-y-2">
            <li>
              <strong>Schedule a consultation</strong> - Let's discuss your plan in detail and answer any questions you might have.
            </li>
            <li>
              <strong>Finalize scope and timeline</strong> - We'll work together to define the exact scope and timeline for your project.
            </li>
            <li>
              <strong>Kickoff your project</strong> - Once agreements are in place, we'll schedule your kickoff and begin implementation.
            </li>
          </ol>
          
          <div className="mt-8 text-center bg-gray-50 p-6 rounded-lg">
            <h4 className="text-xl font-medium mb-4">Contact us to get started</h4>
            <p className="mb-2">Email: <a href="mailto:hello@planform.ai" className="text-primary">hello@planform.ai</a></p>
            <p>Phone: <a href="tel:+15555555555" className="text-primary">(555) 555-5555</a></p>
          </div>
        </CardContent>
      </Card>

      {/* Print controls at bottom - will be hidden when printing */}
      <div className="print:hidden flex justify-center mt-12">
        <Button onClick={printPage} className="mx-2">
          <Printer className="mr-2 h-4 w-4" />
          Print This Plan
        </Button>
        <Button onClick={downloadPDF} variant="outline" className="mx-2">
          <Download className="mr-2 h-4 w-4" />
          Save as PDF
        </Button>
      </div>
      
      {/* Footer - visible in print */}
      <div className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-500 text-sm">
        <p>© {new Date().getFullYear()} Planform.ai</p>
        <p className="mt-1">This plan is confidential and tailored specifically for your business needs.</p>
      </div>
    </div>
  );
} 