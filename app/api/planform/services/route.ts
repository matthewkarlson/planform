import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { services, agencies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

// Simple API key validation - in a real app, you would use a more secure method
// and store API keys securely in a database with proper validation
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get('apiKey');

    // Require API key authentication
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Valid API key required' },
        { status: 401 }
      );
    }

    // First, find the agency by API key
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.apiKey, apiKey),
      columns: {
        id: true
      }
    });

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }

    // Then fetch services for this agency
    const agencyServices = await db.query.services.findMany({
      where: and(
        eq(services.agencyId, agency.id),
        eq(services.isActive, true)
      )
    });

    return NextResponse.json(agencyServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
  }
} 