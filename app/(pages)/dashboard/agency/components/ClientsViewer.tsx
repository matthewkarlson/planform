'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ExternalLink, Search, Download, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import PlanViewer from './PlanViewer';

interface Client {
  id: number;
  name: string | null;
  email: string;
  websiteUrl?: string | null;
  createdAt: string;
  updatedAt?: string;
  planId?: number;
  planTitle?: string;
}

interface ClientsViewerProps {
  agencyId: number;
}

export default function ClientsViewer({ agencyId }: ClientsViewerProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState<number | undefined>(undefined);
  const [isPlanViewerOpen, setIsPlanViewerOpen] = useState(false);

  useEffect(() => {
    const fetchClients = async () => {
      if (!agencyId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`/api/agency/${agencyId}/clients`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch clients');
        }
        
        const data = await response.json();
        setClients(data);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError(err instanceof Error ? err.message : 'Failed to load clients');
      } finally {
        setLoading(false);
      }
    };
    
    fetchClients();
  }, [agencyId]);

  const filteredClients = clients.filter(client => 
    client.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.websiteUrl?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.planTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Function to handle exporting client data
  const handleExportCSV = () => {
    if (clients.length === 0) return;
    
    // Create CSV content
    const csvHeader = ['Name', 'Email', 'Website', 'Plan', 'Created At'].join(',');
    const csvRows = filteredClients.map(client => {
      const createdDate = client.createdAt ? format(new Date(client.createdAt), 'yyyy-MM-dd') : '';
      return [
        client.name || '',
        client.email || '',
        client.websiteUrl || '',
        client.planTitle || '',
        createdDate
      ].map(field => `"${field.replace(/"/g, '""')}"`).join(',');
    });
    
    const csvContent = [csvHeader, ...csvRows].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `agency-${agencyId}-clients.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openPlanViewer = (planId: number) => {
    setSelectedPlanId(planId);
    setIsPlanViewerOpen(true);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Clients & Plans</CardTitle>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleExportCSV}
              disabled={clients.length === 0}
            >
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search clients..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {loading ? (
            <div className="py-8 text-center">Loading clients...</div>
          ) : error ? (
            <div className="py-8 text-center text-red-500">{error}</div>
          ) : clients.length === 0 ? (
            <div className="py-8 text-center text-gray-500">No clients found for this agency.</div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Plan</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">{client.name}</TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>
                        {client.websiteUrl && (
                          <a 
                            href={client.websiteUrl.startsWith('http') ? client.websiteUrl : `https://${client.websiteUrl}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-600 hover:underline"
                          >
                            {client.websiteUrl.replace(/^https?:\/\//, '')}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        )}
                      </TableCell>
                      <TableCell>{client.planTitle || 'No plan'}</TableCell>
                      <TableCell>
                        {client.createdAt ? format(new Date(client.createdAt), 'MMM dd, yyyy') : ''}
                      </TableCell>
                      <TableCell>
                        {client.planId && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openPlanViewer(client.planId!)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Plan
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PlanViewer 
        planId={selectedPlanId} 
        isOpen={isPlanViewerOpen} 
        onClose={() => setIsPlanViewerOpen(false)} 
      />
    </>
  );
} 