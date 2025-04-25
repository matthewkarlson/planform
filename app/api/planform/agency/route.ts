import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

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
    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.apiKey, apiKey),
      columns: {
        id: true,
        name: true,
        logoUrl: true,
        contactNumber: true,
        email: true,
        bookingLink: true,
        primaryColor: true,
        secondaryColor: true,
        backgroundColor: true
      }
    });

    if (!agency) {
      return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
    }
    return NextResponse.json(agency);
  } catch (error) {
    console.error('Error fetching agency:', error);
    return NextResponse.json({ error: 'Failed to fetch agency details' }, { status: 500 });
  }
} 