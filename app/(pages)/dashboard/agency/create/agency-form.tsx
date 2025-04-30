'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface AgencyCreationFormProps {
  teamId: number;
  userId: number;
}

export default function AgencyCreationForm({ teamId, userId }: AgencyCreationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    websiteUrl: '',
    email: '',
    contactNumber: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#1E40AF',
    backgroundColor: '#F8FAFC',
    textColor: '#1E293B',
    currency: '$'
  });
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/agency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          teamId
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create agency');
      }
      
      // Redirect to the agency dashboard after successful creation
      router.push('/dashboard/agency');
      router.refresh();
    } catch (error) {
      console.error('Error creating agency:', error);
      setError(error instanceof Error ? error.message : 'Failed to create agency');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="p-4 mb-6 rounded-md bg-red-50 text-red-800">
          {error}
        </div>
      )}
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Agency Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="name">Agency Name *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            

            
            <div className="md:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                placeholder="Describe your agency's services and specialties"
              />
            </div>
            
            <div>
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                name="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                placeholder="https://youragency.com"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="contact@youragency.com"
              />
            </div>
            
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                placeholder="+1 555 123 4567"
              />
            </div>
            
            <div>
              <Label htmlFor="currency">Currency Symbol</Label>
              <Input
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                maxLength={1}
              />
              <p className="text-sm text-gray-500 mt-1">
                Single character used for pricing (e.g., $, €, £)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Branding</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="primaryColor">Primary Color</Label>
              <div className="flex space-x-2">
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                />
                <input
                  type="color"
                  value={formData.primaryColor}
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
                  value={formData.secondaryColor}
                  onChange={handleInputChange}
                />
                <input
                  type="color"
                  value={formData.secondaryColor}
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
                  value={formData.backgroundColor}
                  onChange={handleInputChange}
                />
                <input
                  type="color"
                  value={formData.backgroundColor}
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
                  value={formData.textColor}
                  onChange={handleInputChange}
                />
                <input
                  type="color"
                  value={formData.textColor}
                  onChange={(e) => setFormData(prev => ({ ...prev, textColor: e.target.value }))}
                  className="h-10 w-10 rounded border"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/dashboard/agency')}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Creating...' : 'Create Agency'}
        </Button>
      </div>
    </form>
  );
} 