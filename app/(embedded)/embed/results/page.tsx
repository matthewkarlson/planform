'use client';

import { useState, useEffect, Suspense } from 'react';
import useAutosizeIframe from '@/lib/useAutosizeIframe';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ArrowLeft, Calendar } from 'lucide-react';
import Link from 'next/link';
import { ServiceRecommendation, ServiceData, AgencyData, WebsiteAnalysis, AnalysisResponse } from '@/lib/types/embed';

// Component that uses useSearchParams, to be wrapped in Suspense
function Results() {
  const searchParams = useSearchParams();
  const recommendationId = searchParams.get('id');
  const apiKey = searchParams.get('apiKey'); // Get API key from URL
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [services, setServices] = useState<Record<string, ServiceData>>({});
  const [clientName, setClientName] = useState<string>('');
  const [agency, setAgency] = useState<AgencyData | null>(null);
  useAutosizeIframe([loading, analysis, services]);
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
        
        // Fetch agency data first using API key
        if (apiKey) {
          // Fetch agency details using API key
          const agencyEndpoint = `/api/planform/agency?apiKey=${apiKey}`;
          const agencyResponse = await fetch(agencyEndpoint);
          
          if (agencyResponse.ok) {
            const agencyData = await agencyResponse.json();
            setAgency(agencyData);
            
            // Now fetch services with the agency ID from the retrieved agency data
            const servicesEndpoint = `/api/planform/services?apiKey=${apiKey}`;
            const servicesResponse = await fetch(servicesEndpoint);
            
            if (servicesResponse.ok) {
              const allServices = await servicesResponse.json();
              const servicesMap: Record<string, ServiceData> = {};
              
              for (const service of allServices) {
                servicesMap[service.serviceId] = service;
              }
              
              setServices(servicesMap);
            }
          }
        } else {
          // Demo mode - fetch demo agency and services
          const agencyEndpoint = `/api/planform/agency_demo`;
          const agencyResponse = await fetch(agencyEndpoint);
          
          if (agencyResponse.ok) {
            const agencyData = await agencyResponse.json();
            setAgency(agencyData);
            
            // Fetch demo services
            const servicesEndpoint = `/api/planform/services_demo`;
            const servicesResponse = await fetch(servicesEndpoint);
            
            if (servicesResponse.ok) {
              const allServices = await servicesResponse.json();
              const servicesMap: Record<string, ServiceData> = {};
              
              for (const service of allServices) {
                servicesMap[service.serviceId] = service;
              }
              
              setServices(servicesMap);
            }
          }
        }
        
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
  }, [recommendationId, apiKey]);

  // Update back link to include API key if present
  const getBackUrl = () => {
    const params = new URLSearchParams();
    if (apiKey) params.append('apiKey', apiKey);
    
    return `/embed${params.toString() ? `?${params.toString()}` : ''}`;
  };

  // Get button style based on agency primary color
  const getButtonStyle = () => {
    if (!agency?.primaryColor) return {};
    
    return {
      backgroundColor: agency.primaryColor,
      borderColor: agency.primaryColor,
    };
  };

  // Get card style based on agency background color
  const getCardStyle = () => {
    if (!agency?.backgroundColor) return {};
    
    return {
      backgroundColor: agency.backgroundColor,
    };
  };

  // Get header style based on agency secondary color
  const getHeaderStyle = () => {
    if (!agency?.secondaryColor) return {};
    
    return {
      color: agency.secondaryColor,
    };
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
        <Link href={getBackUrl()}>
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
        <Link href={getBackUrl()}>
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
        <Link href={getBackUrl()}>
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Questionnaire
          </Button>
        </Link>
      </div>

      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4" style={getHeaderStyle()}>{analysis.websiteAnalysis?.companyName ? `${analysis.websiteAnalysis.companyName}'s` : 'Your'} Custom Growth Plan</h1>
        <p className="text-xl text-gray-600">
          {clientName ? `Prepared exclusively for ${clientName}` : 'Prepared exclusively for you'}
        </p>
        <p className="text-md text-gray-500 mt-2">
          By {agency?.name || 'Planform.ai'}
        </p>
      </div>

      {/* Executive Summary */}
      <Card className="mb-12" style={getCardStyle()}>
        <CardHeader>
          <CardTitle className="text-2xl" style={getHeaderStyle()}>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-gray-700">
            {analysis.executiveSummary}
          </p>
          
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <p className="font-medium text-lg">Estimated Investment Range:</p>
            <p className="text-2xl font-bold" style={{ color: agency?.primaryColor || 'var(--primary)' }}>{analysis.totalEstimatedCost.formattedRange}</p>
          </div>
        </CardContent>
      </Card>

      {/* Website Analysis Section */}
      {analysis.websiteAnalysis && (analysis.screenshotUrl || analysis.screenshotBase64) && (
        <>
          <h2 className="text-3xl font-bold text-gray-900 mb-6" style={getHeaderStyle()}>Website First Fold Analysis</h2>
          <Card className="mb-12" style={getCardStyle()}>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-4">Your Current Website</h3>
                  <div className="border rounded-lg overflow-hidden shadow-sm">
                    <img 
                      src={analysis.screenshotUrl || (analysis.screenshotBase64 ? `data:image/png;base64,${analysis.screenshotBase64}` : '')} 
                      alt="Your website screenshot" 
                      className="w-full h-auto"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-2 italic">
                    Screenshot taken during analysis
                  </p>
                </div>
                
                <div>
                  <h3 className="text-xl font-medium text-gray-800 mb-4">Expert Assessment</h3>
                  <p className="text-gray-700 mb-6 italic">
                    "{analysis.websiteAnalysis.overallImpression}"
                  </p>
                </div>
              </div>
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-medium text-lg mb-3 text-green-700">Strengths</h4>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    {analysis.websiteAnalysis.strengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium text-lg mb-3 text-amber-700">Areas for Improvement</h4>
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    {analysis.websiteAnalysis.weaknesses.map((weakness, i) => (
                      <li key={i}>{weakness}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="mt-8">
                <h4 className="font-medium text-lg mb-3 text-blue-700">Recommendations</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    {analysis.websiteAnalysis.recommendations.map((recommendation, i) => (
                      <li key={i}>{recommendation}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* Recommended Services */}
      <h2 className="text-3xl font-bold text-gray-900 mb-6" style={getHeaderStyle()}>Recommended Services</h2>
      
      {analysis.recommendations.map((recommendation, index) => {
        const service = services[recommendation.serviceId];
        if (!service) return null;
        
        return (
          <Card key={index} className="mb-8" style={getCardStyle()}>
            <CardHeader>
              <CardTitle className="text-2xl" style={getHeaderStyle()}>{service.name}</CardTitle>
              <div className="text-gray-500 mt-1">
                {service.priceLower && service.priceUpper ? 
                  `${agency?.currency} ${service.priceLower.toLocaleString()} - ${agency?.currency} ${service.priceUpper.toLocaleString()}` : 
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
      <h2 className="text-3xl font-bold text-gray-900 mb-6" style={getHeaderStyle()}>Implementation Plan</h2>
      <Card className="mb-12" style={getCardStyle()}>
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
      <Card className="mb-8" style={getCardStyle()}>
        <CardHeader>
          <CardTitle className="text-2xl" style={getHeaderStyle()}>Next Steps</CardTitle>
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
            <h4 className="text-xl font-medium mb-4">Got questions? Get in touch:</h4>
            {agency?.email && <p className="mb-2">Email: <a href={`mailto:${agency.email}`} className="text-primary">{agency.email}</a></p>}
            {agency?.contactNumber && <p className="mb-4">Phone: <a href={`tel:${agency.contactNumber}`} className="text-primary">{agency.contactNumber}</a></p>}
            
          </div>
        </CardContent>
      </Card>

      {/* Big CTA Button - will be hidden when printing */}
      {agency?.bookingLink && (
        <div className="mt-12 mb-16">
          <a href={agency.bookingLink} target="_blank" rel="noopener noreferrer" className="block">
            <Button 
              className="w-full py-8 text-xl shadow-lg transition-transform hover:scale-105"
              style={agency?.primaryColor ? 
                { 
                  backgroundColor: agency.primaryColor || undefined,
                  borderColor: agency.primaryColor || undefined 
                } : undefined}
            >
              <Calendar className="mr-3 h-6 w-6" />
              Book This Plan Now
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}

// Main component that wraps Results in a Suspense boundary
export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold">Loading your custom plan...</h1>
        <p className="mt-4">Please wait while we prepare your results.</p>
      </div>
    }>
      <Results />
    </Suspense>
  );
} 