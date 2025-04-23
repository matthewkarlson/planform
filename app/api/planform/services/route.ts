import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { services } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    // Check if user is logged in
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Get agency ID from URL query parameter
    const url = new URL(request.url);
    const agencyId = url.searchParams.get('agencyId');

    if (!agencyId) {
      return NextResponse.json(
        { error: 'Agency ID is required' },
        { status: 400 }
      );
    }

    // Fetch services filtered by agency ID
    const agencyServices = await db
      .select()
      .from(services)
      .where(eq(services.agencyId, parseInt(agencyId)));
    
    return NextResponse.json(agencyServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' }, 
      { status: 500 }
    );
  }
} 