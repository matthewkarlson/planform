import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { services } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

// GET /api/agency/[agencyId]/services/[id]
export async function GET(
  request: Request,
  { params }: { params: { agencyId: string; id: string } }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const agencyId = parseInt(params.agencyId);
    const serviceId = parseInt(params.id);
    
    if (isNaN(agencyId) || isNaN(serviceId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // Get the service
    const service = await db.query.services.findFirst({
      where: and(
        eq(services.id, serviceId),
        eq(services.agencyId, agencyId)
      )
    });
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    return NextResponse.json(service);
  } catch (error) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

// PUT /api/agency/[agencyId]/services/[id]
export async function PUT(
  request: Request,
  { params }: { params: { agencyId: string; id: string } }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const agencyId = parseInt(params.agencyId);
    const serviceId = parseInt(params.id);
    
    if (isNaN(agencyId) || isNaN(serviceId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    const data = await request.json();
    
    // Validate required fields
    if (!data.serviceId || !data.name || !data.description) {
      return NextResponse.json(
        { error: 'Service ID, name, and description are required' },
        { status: 400 }
      );
    }
    
    // Check if service exists
    const existingService = await db.query.services.findFirst({
      where: and(
        eq(services.id, serviceId),
        eq(services.agencyId, agencyId)
      )
    });
    
    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    // Update the service
    const updatedService = await db
      .update(services)
      .set({
        serviceId: data.serviceId,
        name: data.name,
        description: data.description,
        outcomes: data.outcomes || [],
        priceLower: data.priceLower,
        priceUpper: data.priceUpper,
        whenToRecommend: data.whenToRecommend || [],
        isActive: data.isActive !== undefined ? data.isActive : true,
        updatedAt: new Date(),
      })
      .where(and(
        eq(services.id, serviceId),
        eq(services.agencyId, agencyId)
      ))
      .returning();
    
    return NextResponse.json(updatedService[0]);
  } catch (error) {
    console.error('Error updating service:', error);
    
    // Check for unique constraint violation
    if (error instanceof Error && error.message.includes('unique constraint')) {
      return NextResponse.json(
        { error: 'A service with this ID already exists' },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    );
  }
}

// DELETE /api/agency/[agencyId]/services/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { agencyId: string; id: string } }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const agencyId = parseInt(params.agencyId);
    const serviceId = parseInt(params.id);
    
    if (isNaN(agencyId) || isNaN(serviceId)) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 });
    }
    
    // Check if service exists
    const existingService = await db.query.services.findFirst({
      where: and(
        eq(services.id, serviceId),
        eq(services.agencyId, agencyId)
      )
    });
    
    if (!existingService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }
    
    // Delete the service
    await db
      .delete(services)
      .where(and(
        eq(services.id, serviceId),
        eq(services.agencyId, agencyId)
      ));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    );
  }
} 