'use client';

import { useState, useRef, useEffect } from 'react';
import { Agency, Team, User } from '@/lib/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import QuestionEditor from './components/QuestionEditor';
import ServiceEditor from './components/ServiceEditor';
import WelcomeStepEditor from './components/WelcomeStepEditor';
import ClientsViewer from './components/ClientsViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EmbedPreview from './components/EmbedPreview';

interface AgencyDashboardProps {
  user: User;
  team: Team;
  agencies: Agency[];
}

export default function AgencyDashboard({ user, team, agencies }: AgencyDashboardProps) {
  const router = useRouter();
  const [selectedAgencyId, setSelectedAgencyId] = useState<number>(agencies[0]?.id || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [activeTab, setActiveTab] = useState('details');
  
  // Find the currently selected agency
  const selectedAgency = agencies.find(agency => agency.id === selectedAgencyId) || agencies[0];
  
  // Form state
  const [formData, setFormData] = useState<Partial<Agency>>(selectedAgency || {});
  
  // Handle agency selection change
  const handleAgencyChange = (agencyId: string) => {
    const id = parseInt(agencyId);
    setSelectedAgencyId(id);
    const agency = agencies.find(a => a.id === id);
    if (agency) {
      setFormData(agency);
    }
  };
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/agency', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedAgencyId,
          ...formData
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update agency');
      }
      
      const updatedAgency = await response.json();
      
      // Update the agency in the local state
      const updatedAgencies = agencies.map(agency => 
        agency.id === selectedAgencyId ? { ...agency, ...updatedAgency } : agency
      );
      
      setMessage({ type: 'success', text: 'Agency updated successfully' });
      // Refresh the page data
      router.refresh();
    } catch (error) {
      console.error('Error updating agency:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Failed to update agency' });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // No agencies available
  if (agencies.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8">
        <h2 className="text-2xl font-bold mb-4">No Agencies Found</h2>
        <p className="text-gray-500 mb-6">You don't have any agencies set up yet.</p>
        <Button onClick={() => router.push('/dashboard/agency/create')}>
          Create Your First Agency
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Agency Management</h1>
      
      {/* Agency Selector */}
      <div className="mb-8">
        <Label htmlFor="agency-select">Select Agency</Label>
        <div className="flex items-center gap-4">
          <Select
            value={selectedAgencyId.toString()}
            onValueChange={handleAgencyChange}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select an agency" />
            </SelectTrigger>
            <SelectContent>
              {agencies.map(agency => (
                <SelectItem key={agency.id} value={agency.id.toString()}>
                  {agency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline"
            onClick={() => router.push('/dashboard/agency/create')}
          >
            Create New Agency
          </Button>
        </div>
      </div>
      
      {/* Status Message */}
      {message && (
        <div className={`p-4 mb-6 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="mb-6">
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="details">Agency Details</TabsTrigger>
          <TabsTrigger value="questions">Questionnaire</TabsTrigger>
          <TabsTrigger value="welcomeStep">Welcome Step</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          {/* Agency Edit Form */}
          <form onSubmit={handleSubmit}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Agency Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name">Agency Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  

                  
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="contactNumber">Contact Number</Label>
                    <Input
                      id="contactNumber"
                      name="contactNumber"
                      value={formData.contactNumber || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="websiteUrl">Website URL</Label>
                    <Input
                      id="websiteUrl"
                      name="websiteUrl"
                      value={formData.websiteUrl || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="bookingLink">Booking Link</Label>
                    <Input
                      id="bookingLink"
                      name="bookingLink"
                      value={formData.bookingLink || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description || ''}
                      onChange={handleInputChange}
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Branding</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="logoUrl">Logo URL</Label>
                    <Input
                      id="logoUrl"
                      name="logoUrl"
                      value={formData.logoUrl || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency">Currency Symbol</Label>
                    <Input
                      id="currency"
                      name="currency"
                      value={formData.currency || '$'}
                      onChange={handleInputChange}
                      maxLength={1}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="primaryColor">Primary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="primaryColor"
                        name="primaryColor"
                        value={formData.primaryColor || '#000000'}
                        onChange={handleInputChange}
                      />
                      <input
                        type="color"
                        value={formData.primaryColor || '#000000'}
                        onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                        className="h-10 w-10 rounded border"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="secondaryColor">Secondary Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="secondaryColor"
                        name="secondaryColor"
                        value={formData.secondaryColor || '#000000'}
                        onChange={handleInputChange}
                      />
                      <input
                        type="color"
                        value={formData.secondaryColor || '#000000'}
                        onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                        className="h-10 w-10 rounded border"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="backgroundColor"
                        name="backgroundColor"
                        value={formData.backgroundColor || '#ffffff'}
                        onChange={handleInputChange}
                      />
                      <input
                        type="color"
                        value={formData.backgroundColor || '#ffffff'}
                        onChange={(e) => setFormData(prev => ({ ...prev, backgroundColor: e.target.value }))}
                        className="h-10 w-10 rounded border"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="textColor"
                        name="textColor"
                        value={formData.textColor || '#000000'}
                        onChange={handleInputChange}
                      />
                      <input
                        type="color"
                        value={formData.textColor || '#000000'}
                        onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                        className="h-10 w-10 rounded border"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <EmbedPreview agency={selectedAgency} formData={formData} />
              </CardContent>
            </Card>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>API Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex space-x-2">
                    <Input
                      id="apiKey"
                      name="apiKey"
                      value={formData.apiKey || ''}
                      onChange={handleInputChange}
                      readOnly
                      className="flex-1"
                    />
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // Copy to clipboard
                        if (formData.apiKey) {
                          navigator.clipboard.writeText(formData.apiKey);
                          setMessage({ type: 'success', text: 'API key copied to clipboard' });
                        }
                      }}
                    >
                      Copy
                    </Button>
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => {
                        // This would typically call an API to generate a new key
                        setMessage({ type: 'error', text: 'API key regeneration must be implemented in the backend' });
                      }}
                    >
                      Regenerate
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Use this key to authenticate API requests to your agency's resources.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </TabsContent>
        
        <TabsContent value="questions">
          {selectedAgencyId ? (
            <QuestionEditor agencyId={selectedAgencyId} />
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-md">
              Please select an agency first to manage its questionnaire.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="welcomeStep">
          {selectedAgencyId ? (
            <WelcomeStepEditor agencyId={selectedAgencyId} />
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-md">
              Please select an agency first to manage its welcome step.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="services">
          {selectedAgencyId ? (
            <ServiceEditor agencyId={selectedAgencyId} />
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-md">
              Please select an agency first to manage its services.
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="clients">
          {selectedAgencyId ? (
            <ClientsViewer agencyId={selectedAgencyId} />
          ) : (
            <div className="text-center p-8 bg-gray-50 rounded-md">
              Please select an agency first to view its clients.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
} 