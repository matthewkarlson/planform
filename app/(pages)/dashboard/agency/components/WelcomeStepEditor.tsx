'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Save, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import EmbedPreview from './EmbedPreview';
import { Agency } from '@/lib/db/schema';
import { WelcomeStep } from '@/lib/types/welcomeStep';

interface WelcomeStepEditorProps {
  agencyId: number;
}

export default function WelcomeStepEditor({ agencyId }: WelcomeStepEditorProps) {
  const router = useRouter();
  const [welcomeStep, setWelcomeStep] = useState<WelcomeStep | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [bulletPoints, setBulletPoints] = useState<string[]>([]);
  const [agency, setAgency] = useState<Agency | null>(null);
  
  // Fetch the welcome step for this agency
  useEffect(() => {
    const fetchWelcomeStep = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/welcomestep?agencyId=${agencyId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch welcome step');
        }
        let welcomeStep = await response.json();
        
        // If no welcome step exists, create a default one
        if (!welcomeStep) {
          welcomeStep = {
            agencyId,
            title: 'Welcome to Your Marketing Planner',
            description: 'Answer a few questions about your business to get a personalized marketing strategy.',
            isWelcomeStep: true,
            fields: [],
            welcomeContent: {
              heading: 'Welcome to Our Marketing Planner',
              subheading: 'This short questionnaire will help us understand your business and create a personalized marketing strategy for you.',
              bulletPoints: [
                'Simple questions about your business',
                'Takes about 3-5 minutes to complete',
                'Get instant recommendations based on your answers'
              ],
              footerText: 'Your responses will help us tailor our recommendations specifically to your business needs.',
              buttonText: 'Get Your Plan'
            }
          };
        }
        
        setWelcomeStep(welcomeStep);
        setBulletPoints(welcomeStep.welcomeContent?.bulletPoints || []);
      } catch (error) {
        console.error('Error fetching welcome step:', error);
        setMessage({ type: 'error', text: 'Failed to load welcome step' });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (agencyId) {
      fetchWelcomeStep();
    }
  }, [agencyId]);

  // Add a new bullet point
  const addBulletPoint = () => {
    setBulletPoints([...bulletPoints, '']);
  };

  // Remove a bullet point
  const removeBulletPoint = (index: number) => {
    const newBulletPoints = [...bulletPoints];
    newBulletPoints.splice(index, 1);
    setBulletPoints(newBulletPoints);
  };

  // Update a bullet point
  const updateBulletPoint = (index: number, value: string) => {
    const newBulletPoints = [...bulletPoints];
    newBulletPoints[index] = value;
    setBulletPoints(newBulletPoints);
  };

  // Handle form input changes
  const handleInputChange = (field: string, value: string) => {
    if (!welcomeStep) return;
    
    setWelcomeStep({
      ...welcomeStep,
      [field]: value
    });
  };

  // Handle welcome content changes
  const handleWelcomeContentChange = (field: string, value: string) => {
    if (!welcomeStep) return;
    
    setWelcomeStep({
      ...welcomeStep,
      welcomeContent: {
        ...welcomeStep.welcomeContent,
        [field]: value
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      if (!welcomeStep) throw new Error('No welcome step data');
      
      // Update bullet points in welcome step
      const updatedWelcomeStep = {
        ...welcomeStep,
        welcomeContent: {
          ...welcomeStep.welcomeContent,
          bulletPoints: bulletPoints.filter(bp => bp.trim() !== '') // Remove empty bullet points
        }
      };
      
      // Ensure isWelcomeStep is true
      updatedWelcomeStep.isWelcomeStep = true;
      
      
      // Replace or add the welcome step
      const saveResponse = await fetch('/api/welcomestep', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agencyId, step: updatedWelcomeStep }),
      });
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save welcome step');
      }
      
      setMessage({ type: 'success', text: 'Welcome step saved successfully' });
      
      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error('Error saving welcome step:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to save welcome step' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Create a preview object compatible with the EmbedPreview component
  const getPreviewAgency = () => {
    if (!agency) return null;
    return agency;
  };

  // Create a modified welcome step for preview
  const getPreviewWelcomeStep = () => {
    if (!welcomeStep) return null;
    
    // Create a modified version with the current bullet points
    return {
      ...welcomeStep,
      welcomeContent: {
        ...welcomeStep.welcomeContent,
        bulletPoints
      }
    };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Welcome Step Editor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <p>Loading welcome step data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Welcome Step Editor</CardTitle>
        </CardHeader>
        <CardContent>
          {message && (
            <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
              {message.text}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label htmlFor="title">Page Title</Label>
                <Input
                  id="title"
                  value={welcomeStep?.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">This appears at the top of the welcome page</p>
              </div>
              
              <div>
                <Label htmlFor="description">Page Description</Label>
                <Textarea
                  id="description"
                  value={welcomeStep?.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={2}
                />
                <p className="text-sm text-gray-500 mt-1">Brief text shown below the title</p>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-4">Welcome Content</h3>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="heading">Heading</Label>
                    <Input
                      id="heading"
                      value={welcomeStep?.welcomeContent?.heading || ''}
                      onChange={(e) => handleWelcomeContentChange('heading', e.target.value)}
                    />
                    <p className="text-sm text-gray-500 mt-1">Main heading displayed in the welcome card</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="subheading">Subheading</Label>
                    <Textarea
                      id="subheading"
                      value={welcomeStep?.welcomeContent?.subheading || ''}
                      onChange={(e) => handleWelcomeContentChange('subheading', e.target.value)}
                      rows={2}
                    />
                    <p className="text-sm text-gray-500 mt-1">Text shown below the heading</p>
                  </div>
                  
                  <div>
                    <Label>Bullet Points</Label>
                    <div className="space-y-2 mt-2">
                      {bulletPoints.map((point, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={point}
                            onChange={(e) => updateBulletPoint(index, e.target.value)}
                            placeholder={`Bullet point ${index + 1}`}
                          />
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon"
                            onClick={() => removeBulletPoint(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addBulletPoint}
                        className="mt-2"
                      >
                        <PlusCircle className="h-4 w-4 mr-2" /> Add Bullet Point
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="footerText">Footer Text</Label>
                    <Textarea
                      id="footerText"
                      value={welcomeStep?.welcomeContent?.footerText || ''}
                      onChange={(e) => handleWelcomeContentChange('footerText', e.target.value)}
                      rows={2}
                    />
                    <p className="text-sm text-gray-500 mt-1">Text shown at the bottom of the welcome card</p>
                  </div>
                  
                  <div>
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={welcomeStep?.welcomeContent?.buttonText || ''}
                      onChange={(e) => handleWelcomeContentChange('buttonText', e.target.value)}
                      placeholder="Get Your Plan"
                    />
                    <p className="text-sm text-gray-500 mt-1">Text shown on the button to proceed</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Saving...' : 'Save Welcome Step'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Live Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Eye className="h-4 w-4 mr-2" /> Live Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">This is how your welcome step will appear to users.</p>
          {agency && welcomeStep && (
            <div className="border rounded-lg p-4 bg-gray-50">
              <EmbedPreview 
                agency={agency} 
                formData={{}} 
                customWelcomeStep={getPreviewWelcomeStep()} 
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 