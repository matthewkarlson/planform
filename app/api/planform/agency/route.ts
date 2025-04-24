import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Agency ID is required' }, { status: 400 });
    }

    const agencyId = parseInt(id);
    if (isNaN(agencyId)) {
      return NextResponse.json({ error: 'Invalid agency ID format' }, { status: 400 });
    }

    const agency = await db.query.agencies.findFirst({
      where: eq(agencies.id, agencyId),
      columns: {
        id: true,
        name: true,
        logoUrl: true,
        contactNumber: true,
        email: true,
        bookingLink: true,
        primaryColor: true
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