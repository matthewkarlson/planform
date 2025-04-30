'use client';

import { useState, useEffect, useRef } from 'react';
import { Service } from '@/lib/db/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { PlusCircle, Trash2, Save, Plus, Minus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter } from 'next/navigation';

interface ServiceEditorProps {
  agencyId: number;
}

interface ServiceItem {
  id?: number;
  serviceId: string;
  name: string;
  description: string;
  outcomes: string[];
  priceLower: number | null;
  priceUpper: number | null;
  whenToRecommend: string[];
  isActive: boolean;
  isNew?: boolean;
}

export default function ServiceEditor({ agencyId }: ServiceEditorProps) {
  const router = useRouter();
  const bottomRef = useRef<HTMLDivElement>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch(`/api/agency/${agencyId}/services`);
        if (!response.ok) {
          throw new Error('Failed to fetch services');
        }
        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Error fetching services:', error);
        setMessage({ type: 'error', text: 'Failed to load services' });
      } finally {
        setLoading(false);
      }
    }

    if (agencyId) {
      fetchServices();
    }
  }, [agencyId]);

  const handleAddService = () => {
    setServices([
      ...services,
      {
        serviceId: '',
        name: '',
        description: '',
        outcomes: [''],
        priceLower: null,
        priceUpper: null,
        whenToRecommend: [''],
        isActive: true,
        isNew: true
      }
    ]);
    
    // Scroll to bottom after state update
    setTimeout(() => {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleRemoveService = async (index: number) => {
    const service = services[index];
    
    if (service.id) {
      // Existing service, delete from database
      try {
        const response = await fetch(`/api/agency/${agencyId}/services/${service.id}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete service');
        }
        
        setMessage({ type: 'success', text: 'Service deleted successfully' });
      } catch (error) {
        console.error('Error deleting service:', error);
        setMessage({ type: 'error', text: 'Failed to delete service' });
        return;
      }
    }
    
    // Remove from state
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setServices(updatedServices);
  };

  const handleServiceChange = (index: number, field: keyof ServiceItem, value: any) => {
    const updatedServices = [...services];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value
    };
    setServices(updatedServices);
  };

  const handleArrayItemChange = (
    serviceIndex: number, 
    field: 'outcomes' | 'whenToRecommend', 
    itemIndex: number, 
    value: string
  ) => {
    const updatedServices = [...services];
    updatedServices[serviceIndex][field][itemIndex] = value;
    setServices(updatedServices);
  };

  const handleAddArrayItem = (serviceIndex: number, field: 'outcomes' | 'whenToRecommend') => {
    const updatedServices = [...services];
    updatedServices[serviceIndex][field].push('');
    setServices(updatedServices);
  };

  const handleRemoveArrayItem = (
    serviceIndex: number, 
    field: 'outcomes' | 'whenToRecommend', 
    itemIndex: number
  ) => {
    const updatedServices = [...services];
    updatedServices[serviceIndex][field].splice(itemIndex, 1);
    setServices(updatedServices);
  };

  const handleSaveServices = async () => {
    setSaving(true);
    setMessage(null);
    
    try {
      // Validate all services before saving
      const invalidServices = services.filter(
        service => !service.serviceId || !service.name || !service.description
      );
      
      if (invalidServices.length > 0) {
        throw new Error('All services must have an ID, name, and description');
      }
      
      // Process each service
      for (const service of services) {
        const method = service.isNew ? 'POST' : 'PUT';
        const url = service.isNew 
          ? `/api/agency/${agencyId}/services` 
          : `/api/agency/${agencyId}/services/${service.id}`;
        
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...service,
            agencyId: agencyId
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to save service: ${service.name}`);
        }
      }
      
      setMessage({ type: 'success', text: 'Services saved successfully' });
      
      // Refresh the services list
      const response = await fetch(`/api/agency/${agencyId}/services`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
      
      // Refresh the page
      router.refresh();
    } catch (error) {
      console.error('Error saving services:', error);
      setMessage({ 
        type: 'error', 
        text: error instanceof Error ? error.message : 'Failed to save services' 
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Loading services...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Services Management</h2>
        <Button 
          onClick={handleAddService}
          className="flex items-center gap-2"
        >
          <PlusCircle className="h-4 w-4" />
          Add Service
        </Button>
      </div>
      
      {message && (
        <Alert className={message.type === 'error' ? 'bg-red-50' : 'bg-green-50'}>
          <AlertDescription>
            {message.text}
          </AlertDescription>
        </Alert>
      )}
      
      {services.length === 0 ? (
        <div className="p-12 border-2 border-dashed rounded-md text-center">
          <p className="text-gray-500 mb-4">No services defined yet</p>
          <Button onClick={handleAddService}>Add Your First Service</Button>
        </div>
      ) : (
        <div className="space-y-8">
          {services.map((service, serviceIndex) => (
            <Card key={service.id || `new-${serviceIndex}`} className="overflow-hidden">
              <CardHeader className="bg-gray-50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">
                    {service.name || 'New Service'}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveService(serviceIndex)}
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor={`service-id-${serviceIndex}`}>Service ID</Label>
                    <Input
                      id={`service-id-${serviceIndex}`}
                      value={service.serviceId}
                      onChange={(e) => handleServiceChange(serviceIndex, 'serviceId', e.target.value)}
                      placeholder="unique_service_id"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Unique identifier for this service (no spaces)
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor={`service-name-${serviceIndex}`}>Service Name</Label>
                    <Input
                      id={`service-name-${serviceIndex}`}
                      value={service.name}
                      onChange={(e) => handleServiceChange(serviceIndex, 'name', e.target.value)}
                      placeholder="Service Name"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label htmlFor={`service-desc-${serviceIndex}`}>Description</Label>
                    <Textarea
                      id={`service-desc-${serviceIndex}`}
                      value={service.description}
                      onChange={(e) => handleServiceChange(serviceIndex, 'description', e.target.value)}
                      placeholder="Describe this service..."
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`price-lower-${serviceIndex}`}>Price Range (Lower)</Label>
                    <Input
                      id={`price-lower-${serviceIndex}`}
                      type="number"
                      value={service.priceLower || ''}
                      onChange={(e) => handleServiceChange(
                        serviceIndex, 
                        'priceLower', 
                        e.target.value ? parseInt(e.target.value) : null
                      )}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`price-upper-${serviceIndex}`}>Price Range (Upper)</Label>
                    <Input
                      id={`price-upper-${serviceIndex}`}
                      type="number"
                      value={service.priceUpper || ''}
                      onChange={(e) => handleServiceChange(
                        serviceIndex, 
                        'priceUpper', 
                        e.target.value ? parseInt(e.target.value) : null
                      )}
                      placeholder="0"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>Outcomes</Label>
                    <div className="space-y-2 mt-2">
                      {service.outcomes.map((outcome, outcomeIndex) => (
                        <div key={outcomeIndex} className="flex gap-2">
                          <Input
                            value={outcome}
                            onChange={(e) => handleArrayItemChange(
                              serviceIndex, 
                              'outcomes', 
                              outcomeIndex, 
                              e.target.value
                            )}
                            placeholder="What clients will achieve..."
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => handleRemoveArrayItem(serviceIndex, 'outcomes', outcomeIndex)}
                            disabled={service.outcomes.length <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        type="button"
                        onClick={() => handleAddArrayItem(serviceIndex, 'outcomes')}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Outcome
                      </Button>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2">
                    <Label>When to Recommend</Label>
                    <div className="space-y-2 mt-2">
                      {service.whenToRecommend.map((recommend, recommendIndex) => (
                        <div key={recommendIndex} className="flex gap-2">
                          <Input
                            value={recommend}
                            onChange={(e) => handleArrayItemChange(
                              serviceIndex, 
                              'whenToRecommend', 
                              recommendIndex, 
                              e.target.value
                            )}
                            placeholder="Recommend when..."
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() => handleRemoveArrayItem(
                              serviceIndex, 
                              'whenToRecommend', 
                              recommendIndex
                            )}
                            disabled={service.whenToRecommend.length <= 1}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        type="button"
                        onClick={() => handleAddArrayItem(serviceIndex, 'whenToRecommend')}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add Recommendation
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {services.length > 0 && (
        <div className="flex justify-end mt-6">
          <Button
            onClick={handleSaveServices}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : 'Save All Services'}
          </Button>
        </div>
      )}
      
      {/* Reference element at the bottom */}
      <div ref={bottomRef} />
    </div>
  );
} 