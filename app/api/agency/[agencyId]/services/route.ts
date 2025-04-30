import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { services } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// GET /api/agency/[agencyId]/services
export async function GET(
  request: Request,
  { params }: { params: { agencyId: string } }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const agencyId = parseInt(params.agencyId);
    
    if (isNaN(agencyId)) {
      return NextResponse.json({ error: 'Invalid agency ID' }, { status: 400 });
    }
    
    // Get all services for this agency
    const agencyServices = await db.query.services.findMany({
      where: eq(services.agencyId, agencyId),
      orderBy: (services, { asc }) => [asc(services.name)]
    });
    
    return NextResponse.json(agencyServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// POST /api/agency/[agencyId]/services
export async function POST(
  request: Request,
  { params }: { params: { agencyId: string } }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const agencyId = parseInt(params.agencyId);
    
    if (isNaN(agencyId)) {
      return NextResponse.json({ error: 'Invalid agency ID' }, { status: 400 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.serviceId || !data.name || !data.description) {
      return NextResponse.json(
        { error: 'Service ID, name, and description are required' },
        { status: 400 }
      );
    }
    
    // Create the service
    const newService = await db.insert(services).values({
      agencyId,
      serviceId: data.serviceId,
      name: data.name,
      description: data.description,
      outcomes: data.outcomes || [],
      priceLower: data.priceLower || null,
      priceUpper: data.priceUpper || null,
      whenToRecommend: data.whenToRecommend || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
    }).returning();
    
    return NextResponse.json(newService[0]);
  } catch (error) {
    console.error('Error creating service:', error);
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'A service with this ID already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    );
  }
} 