import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { services } from '@/lib/db/schema';

export async function GET() {
  try {
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