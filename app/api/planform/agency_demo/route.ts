import { NextResponse } from 'next/server';

// Demo agency data
const demoAgency = {
  id: 1,
  name: 'Planform Demo Agency',
  slug: 'planform-demo',
  logoUrl: '/images/logo_demo.png',
  websiteUrl: 'https://example.com',
  contactNumber: '(555) 123-4567',
  email: 'hello@planform.ai',
  bookingLink: 'https://calendly.com/planform-demo/strategy-call',
  description: 'A demo agency for testing the Planform platform.',
  primaryColor: '#3B82F6',
  secondaryColor: '#1E3A8A',
  backgroundColor: '#F8FAFC',
  apiKey: 'demo_key_12345',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  isActive: true
};

export async function GET() {
  // Return the demo agency data
  return NextResponse.json(demoAgency);
} 