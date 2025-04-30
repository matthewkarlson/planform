import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { agencies, teams } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { v4 as uuidv4 } from 'uuid';

// Get all agencies for the current user's team
export async function GET() {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 });
    }

    // Check if the team has a paid subscription
    const hasPaidSubscription = team.subscriptionStatus === 'active' || 
                              team.subscriptionStatus === 'trialing';
    
    if (!hasPaidSubscription) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
    }

    const teamAgencies = await db.query.agencies.findMany({
      where: eq(agencies.teamId, team.id),
      orderBy: (agencies, { asc }) => [asc(agencies.name)]
    });

    return NextResponse.json(teamAgencies);
  } catch (error) {
    console.error('Error fetching agencies:', error);
    return NextResponse.json({ error: 'Failed to fetch agencies' }, { status: 500 });
  }
}

// Create a new agency
export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 });
    }

    // Check if the team has a paid subscription
    const hasPaidSubscription = team.subscriptionStatus === 'active' || 
                                team.subscriptionStatus === 'trialing';
    
    if (!hasPaidSubscription) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ 
        error: 'Name is a required field' 
      }, { status: 400 });
    }
    

    
    // Generate an API key
    const apiKey = uuidv4();
    
    // Prepare data for insertion
    const newAgency = {
      name: data.name,
      description: data.description || null,
      websiteUrl: data.websiteUrl || null,
      contactNumber: data.contactNumber || null,
      email: data.email || null,
      bookingLink: data.bookingLink || null,
      logoUrl: data.logoUrl || null,
      primaryColor: data.primaryColor || null,
      secondaryColor: data.secondaryColor || null,
      backgroundColor: data.backgroundColor || null,
      textColor: data.textColor || null,
      apiKey,
      currency: data.currency || '$',
      isActive: true,
      teamId: team.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Create the agency
    const [createdAgency] = await db
      .insert(agencies)
      .values(newAgency)
      .returning();
    
    return NextResponse.json(createdAgency);
  } catch (error) {
    console.error('Error creating agency:', error);
    return NextResponse.json({ error: 'Failed to create agency' }, { status: 500 });
  }
}

// Update an agency
export async function PUT(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const team = await getTeamForUser();
    if (!team) {
      return NextResponse.json({ error: 'No team found' }, { status: 404 });
    }

    // Check if the team has a paid subscription
    const hasPaidSubscription = team.subscriptionStatus === 'active' || 
                              team.subscriptionStatus === 'trialing';
    
    if (!hasPaidSubscription) {
      return NextResponse.json({ error: 'Subscription required' }, { status: 403 });
    }

    const data = await request.json();
    
    // Validate that this agency belongs to the user's team
    const agencyToUpdate = await db.query.agencies.findFirst({
      where: and(
        eq(agencies.id, data.id),
        eq(agencies.teamId, team.id)
      )
    });

    if (!agencyToUpdate) {
      return NextResponse.json({ error: 'Agency not found or access denied' }, { status: 404 });
    }

    // Fields that can be updated
    const updateableFields = [
      'name', 'logoUrl', 'websiteUrl', 'contactNumber', 
      'email', 'bookingLink', 'description', 'primaryColor', 
      'secondaryColor', 'backgroundColor', 'textColor', 'currency'
    ];

    // Filter the data to only include updatable fields
    const updateData: Record<string, any> = {};
    for (const field of updateableFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // Add updated timestamp
    updateData.updatedAt = new Date();

    // Update the agency
    const [updatedAgency] = await db
      .update(agencies)
      .set(updateData)
      .where(eq(agencies.id, data.id))
      .returning();

    return NextResponse.json(updatedAgency);
  } catch (error) {
    console.error('Error updating agency:', error);
    return NextResponse.json({ error: 'Failed to update agency' }, { status: 500 });
  }
} 