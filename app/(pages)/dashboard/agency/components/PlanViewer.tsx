'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

interface PlanViewerProps {
  planId: number | undefined;
  isOpen: boolean;
  onClose: () => void;
}

// Define a type for any client responses
type ClientResponses = {
  websiteUrl?: string;
  name?: string;
  email?: string;
  apiKey?: string;
  agencyId?: number;
  [key: string]: any; // Allow any additional properties
};

interface PlanData {
  clientResponses: ClientResponses;
  recommendations: {
    serviceId: string;
    reason: string;
  }[];
  executiveSummary: string;
  totalEstimatedCost: {
    minTotal: number;
    maxTotal: number;
    formattedRange: string;
  };
  websiteAnalysis: any;
  screenshotUrl: string | null;
  screenshotBase64: string | null;
}

export default function PlanViewer({ planId, isOpen, onClose }: PlanViewerProps) {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId || !isOpen) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/plans/${planId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch plan');
        }
        
        const data = await response.json();
        setPlan(data);
      } catch (err) {
        console.error('Error fetching plan:', err);
        setError(err instanceof Error ? err.message : 'Failed to load plan');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlan();
  }, [planId, isOpen]);

  // Helper function to format values based on known formats
  const formatValue = (key: string, value: any): string => {
    // Handle business experience formatting
    if (key.includes('experience') || key.includes('years')) {
      const experienceMap: Record<string, string> = {
        'less_than_1': 'Less than 1 year',
        '1_to_3': '1-3 years',
        '3_to_5': '3-5 years',
        '5_to_10': '5-10 years',
        'more_than_10': 'More than 10 years'
      };
      return experienceMap[value] || value;
    }

    // Handle traffic formatting
    if (key.includes('traffic') || key.includes('visitors')) {
      const trafficMap: Record<string, string> = {
        'under_1k': 'Under 1,000 monthly visitors',
        '1k-5k': '1,000-5,000 monthly visitors',
        '5k-20k': '5,000-20,000 monthly visitors',
        '20k-100k': '20,000-100,000 monthly visitors',
        'over_100k': 'Over 100,000 monthly visitors'
      };
      return trafficMap[value] || value;
    }

    // For other string values
    if (typeof value === 'string') {
      return value;
    }

    // For array values
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    // For other values
    return JSON.stringify(value);
  };

  // Function to render client response fields
  const renderClientResponses = () => {
    if (!plan?.clientResponses) return null;

    // Guaranteed fields to show first
    const guaranteedFields = ['name', 'email', 'websiteUrl'];
    
    // Display all other fields except apiKey and agencyId
    const otherFields = Object.keys(plan.clientResponses)
      .filter(key => !guaranteedFields.includes(key) && key !== 'apiKey' && key !== 'agencyId');

    return (
      <div className="space-y-4">
        {/* Display guaranteed fields first */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guaranteedFields.map(field => {
            if (!plan.clientResponses[field]) return null;
            
            if (field === 'websiteUrl') {
              return (
                <div key={field}>
                  <h3 className="text-sm font-medium text-gray-500">Website</h3>
                  <a 
                    href={plan.clientResponses[field]} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    {plan.clientResponses[field]}
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              );
            }
            
            return (
              <div key={field}>
                <h3 className="text-sm font-medium text-gray-500">
                  {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}
                </h3>
                <p>{plan.clientResponses[field]}</p>
              </div>
            );
          })}
        </div>
        
        {/* Display all other fields */}
        {otherFields.map(field => {
          const value = plan.clientResponses[field];
          if (value === undefined || value === null || value === '') return null;
          
          // Format the display name of the field
          const displayName = field
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .split('_').join(' ') // Replace underscores with spaces
            .replace(/^\w/, c => c.toUpperCase()); // Capitalize first letter
          
          if (Array.isArray(value)) {
            return (
              <div key={field}>
                <h3 className="text-sm font-medium text-gray-500">{displayName}</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {value.map((item, index) => (
                    <Badge key={index} variant="outline" className="capitalize">
                      {typeof item === 'string' ? item : JSON.stringify(item)}
                    </Badge>
                  ))}
                </div>
              </div>
            );
          }
          
          return (
            <div key={field}>
              <h3 className="text-sm font-medium text-gray-500">{displayName}</h3>
              <p className={typeof value === 'string' && value.length > 100 ? "whitespace-pre-wrap" : ""}>
                {formatValue(field, value)}
              </p>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Growth Plan</DialogTitle>
          <DialogDescription>
            Personalized growth plan for {plan?.clientResponses.name || 'client'}
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="py-8 text-center">Loading plan details...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">{error}</div>
        ) : !plan ? (
          <div className="py-8 text-center text-gray-500">Plan not found</div>
        ) : (
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="client-info">Client Info</TabsTrigger>
              {plan.websiteAnalysis && (
                <TabsTrigger value="website-analysis">Website Analysis</TabsTrigger>
              )}
            </TabsList>
            
            <TabsContent value="summary">
              <Card>
                <CardHeader>
                  <CardTitle>Executive Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap">{plan.executiveSummary}</p>
                  
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Total Estimated Investment</h3>
                    <Badge className="text-base px-3 py-1 bg-blue-100 text-blue-800 border-blue-300">
                      {plan.totalEstimatedCost.formattedRange}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="recommendations">
              <div className="space-y-4">
                {plan.recommendations.map((rec, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        {rec.serviceId.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>{rec.reason}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="client-info">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                </CardHeader>
                <CardContent>
                  {renderClientResponses()}
                </CardContent>
              </Card>
            </TabsContent>
            
            {plan.websiteAnalysis && (
              <TabsContent value="website-analysis">
                <Card>
                  <CardHeader>
                    <CardTitle>Website Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {plan.screenshotUrl && (
                      <div className="mb-6">
                        <img 
                          src={plan.screenshotUrl} 
                          alt="Website Screenshot" 
                          className="w-full h-auto rounded-md border"
                        />
                      </div>
                    )}
                    
                    {plan.websiteAnalysis && typeof plan.websiteAnalysis === 'string' ? (
                      <p className="whitespace-pre-wrap">{plan.websiteAnalysis}</p>
                    ) : plan.websiteAnalysis ? (
                      <div className="space-y-4">
                        {plan.websiteAnalysis.strengths && (
                          <div>
                            <h3 className="text-md font-semibold">Strengths</h3>
                            <ul className="list-disc pl-5 mt-2">
                              {plan.websiteAnalysis.strengths.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {plan.websiteAnalysis.weaknesses && (
                          <div>
                            <h3 className="text-md font-semibold">Areas for Improvement</h3>
                            <ul className="list-disc pl-5 mt-2">
                              {plan.websiteAnalysis.weaknesses.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {plan.websiteAnalysis.recommendations && (
                          <div>
                            <h3 className="text-md font-semibold">Recommendations</h3>
                            <ul className="list-disc pl-5 mt-2">
                              {plan.websiteAnalysis.recommendations.map((item: string, i: number) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {plan.websiteAnalysis.overallImpression && (
                          <div>
                            <h3 className="text-md font-semibold">Overall Impression</h3>
                            <p className="mt-2">{plan.websiteAnalysis.overallImpression}</p>
                          </div>
                        )}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
} 