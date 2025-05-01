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

interface PlanData {
  clientResponses: {
    websiteUrl: string;
    businessType: string;
    businessExperience: string;
    primaryGoal: string;
    marketingActivities: string[];
    pastChallenges: string;
    conversionFlow: string;
    currentChallenges: string;
    differentiator: string;
    websiteTraffic: string;
    name: string;
    email: string;
    apiKey: string;
    agencyId: number;
  };
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

  // Format business experience
  const formatBusinessExperience = (exp: string) => {
    const mapping: Record<string, string> = {
      'less_than_1': 'Less than 1 year',
      '1_to_3': '1-3 years',
      '3_to_5': '3-5 years',
      '5_to_10': '5-10 years',
      'more_than_10': 'More than 10 years'
    };
    return mapping[exp] || exp;
  };

  // Format website traffic
  const formatWebsiteTraffic = (traffic: string) => {
    const mapping: Record<string, string> = {
      'under_1k': 'Under 1,000 monthly visitors',
      '1k-5k': '1,000-5,000 monthly visitors',
      '5k-20k': '5,000-20,000 monthly visitors',
      '20k-100k': '20,000-100,000 monthly visitors',
      'over_100k': 'Over 100,000 monthly visitors'
    };
    return mapping[traffic] || traffic;
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
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Name</h3>
                        <p>{plan.clientResponses.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Email</h3>
                        <p>{plan.clientResponses.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Website</h3>
                        <a 
                          href={plan.clientResponses.websiteUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:underline"
                        >
                          {plan.clientResponses.websiteUrl}
                          <ExternalLink className="ml-1 h-3 w-3" />
                        </a>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Business Type</h3>
                        <p className="capitalize">{plan.clientResponses.businessType}</p>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Business Experience</h3>
                      <p>{formatBusinessExperience(plan.clientResponses.businessExperience)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Primary Goal</h3>
                      <p className="capitalize">{plan.clientResponses.primaryGoal}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Website Traffic</h3>
                      <p>{formatWebsiteTraffic(plan.clientResponses.websiteTraffic)}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Marketing Activities</h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {plan.clientResponses.marketingActivities.map((activity, index) => (
                          <Badge key={index} variant="outline" className="capitalize">
                            {activity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Current Challenges</h3>
                      <p className="capitalize">{plan.clientResponses.currentChallenges}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Differentiator</h3>
                      <p>{plan.clientResponses.differentiator}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Past Challenges</h3>
                      <p>{plan.clientResponses.pastChallenges}</p>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Conversion Flow</h3>
                      <p>{plan.clientResponses.conversionFlow}</p>
                    </div>
                  </div>
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
                    ) : (
                      <div className="space-y-4">
                        {/* Render structured analysis if it's an object */}
                        <pre>{JSON.stringify(plan.websiteAnalysis, null, 2)}</pre>
                      </div>
                    )}
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