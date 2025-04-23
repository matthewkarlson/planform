import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { services } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';

export async function GET() {
  try {
    // Check if user is logged in
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Fetch all services from the database
    const allServices = await db.select().from(services);
    
    return NextResponse.json(allServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' }, 
      { status: 500 }
    );
  }
} 