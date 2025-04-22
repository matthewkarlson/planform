'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

// Default mock data to test the endpoint - matches the questionnaire in planform/page.tsx
const DEFAULT_MOCK_DATA = {
  websiteUrl: "https://example.com",
  businessType: "ecommerce",
  primaryGoal: "conversions",
  marketingActivities: ["paid_ads", "seo", "email"],
  pastChallenges: "We ran Facebook ads but got unqualified leads because our targeting wasn't specific enough.",
  conversionFlow: "Visitors find us through Google ads or organic search, land on product pages, add items to cart, and check out. About 2.3% conversion rate overall.",
  currentChallenges: "conversion",
  differentiator: "We offer sustainable, eco-friendly products with carbon-neutral shipping that our competitors don't provide.",
  websiteTraffic: "5k-10k",
  name: "John Smith",
  email: "john@example.com"
};

export default function ApiTestPage() {
  const [mockData, setMockData] = useState(JSON.stringify(DEFAULT_MOCK_DATA, null, 2));
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'formatted' | 'raw'>('formatted');

  const handleTestApi = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Parse the mock data
      const parsedData = JSON.parse(mockData);
      
      // Send request to the API endpoint
      const res = await fetch('/api/planform/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parsedData),
      });
      
      if (!res.ok) {
        throw new Error(`API responded with status: ${res.status}`);
      }
      
      const data = await res.json();
      setResponse(data);
    } catch (err) {
      console.error('Error testing API:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetMockData = () => {
    setMockData(JSON.stringify(DEFAULT_MOCK_DATA, null, 2));
  };

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">API Endpoint Test Tool</h1>
      <p className="text-gray-600 mb-8">
        Use this tool to test the <code className="bg-gray-100 px-2 py-1 rounded">/api/planform/analyze</code> endpoint with mock data.
      </p>
      
      <div className="grid grid-cols-1 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Mock Request Data</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea 
              className="font-mono text-sm h-64"
              value={mockData}
              onChange={(e) => setMockData(e.target.value)}
            />
            <div className="flex gap-4 mt-4">
              <Button onClick={handleTestApi} disabled={loading}>
                {loading ? 'Testing...' : 'Test Endpoint'}
              </Button>
              <Button variant="outline" onClick={resetMockData}>
                Reset to Default
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
                <strong>Error:</strong> {error}
              </div>
            )}
          </CardContent>
        </Card>
        
        {response && (
          <Card>
            <CardHeader>
              <CardTitle>API Response</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 border-b">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => setActiveTab('formatted')}
                    className={`pb-2 px-3 ${activeTab === 'formatted' ? 'border-b-2 border-indigo-700 font-semibold' : ''}`}
                  >
                    Formatted View
                  </button>
                  <button 
                    onClick={() => setActiveTab('raw')}
                    className={`pb-2 px-3 ${activeTab === 'raw' ? 'border-b-2 border-indigo-700 font-semibold' : ''}`}
                  >
                    Raw JSON
                  </button>
                </div>
              </div>
              
              {activeTab === 'formatted' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Client Information</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      {Object.entries(response.clientResponses).map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <span className="font-medium">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}:</span>{' '}
                          {Array.isArray(value) 
                            ? (value as string[]).map((item, i) => <div key={i} className="ml-4">• {item}</div>)
                            : <span>{value as string}</span>
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Recommendations</h3>
                    <div className="space-y-4">
                      {response.recommendations.map((rec: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-4 rounded-md">
                          <div className="font-medium text-indigo-700 mb-2">{rec.serviceId}</div>
                          <div>{rec.reason}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Total Estimated Cost</h3>
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="text-xl font-bold">{response.totalEstimatedCost.formattedRange}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        Min: ${response.totalEstimatedCost.minTotal.toLocaleString()} | 
                        Max: ${response.totalEstimatedCost.maxTotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'raw' && (
                <Textarea 
                  className="font-mono text-sm h-96"
                  value={JSON.stringify(response, null, 2)}
                  readOnly
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
} 