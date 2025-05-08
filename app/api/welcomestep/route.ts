import { NextRequest, NextResponse } from 'next/server';
import { welcomeSteps, agencies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { getTeamForUser, getUser } from '@/lib/db/queries';


//Get the welcome step for an agency
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const agencyId = searchParams.get('agencyId');
    const apiKey = searchParams.get('apiKey');
    
    // If API key is provided, use it to get the agency and its welcome step
    if (apiKey) {
      // Find the agency by API key
      const agency = await db.query.agencies.findFirst({
        where: eq(agencies.apiKey, apiKey),
        columns: {
          id: true,
          isActive: true
        }
      });

      if (!agency) {
        return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
      }
      
      if (!agency.isActive) {
        return NextResponse.json({ error: 'Agency is inactive' }, { status: 403 });
      }

      // Get welcome step for this agency
      const welcomeStep = await db.query.welcomeSteps.findFirst({
        where: eq(welcomeSteps.agencyId, agency.id)
      });

      if (!welcomeStep) {
        // Return null welcome step if no set exists yet
        return NextResponse.json({ 
          id: null,
          agencyId: agency.id,
          welcomeStep: null
        });
      }

      return NextResponse.json(welcomeStep);
    }
    
    // If no API key, fall back to using agencyId with authentication
    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID or API key is required' }, { status: 400 });
    }
    
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

    // Verify the agency belongs to the user's team
    const agencyExists = await db.query.agencies.findFirst({
      where: and(
        eq(agencies.id, parseInt(agencyId)),
        eq(agencies.teamId, team.id)
      )
    });

    if (!agencyExists) {
      return NextResponse.json({ error: 'Agency not found or access denied' }, { status: 404 });
    }

    // Get the welcome step
    const welcomeStep = await db.query.welcomeSteps.findFirst({
      where: eq(welcomeSteps.agencyId, parseInt(agencyId))
    });

    if (!welcomeStep) {
      // Return null welcome step if none exists yet
      return NextResponse.json({ 
        id: null,
        agencyId: parseInt(agencyId),
        welcomeStep: null
      });
    }

    return NextResponse.json(welcomeStep);
  } catch (error) {
    console.error('Error fetching welcome step:', error);
    return NextResponse.json({ error: 'Failed to fetch welcome step' }, { status: 500 });
  }
}

//Update the welcome step for an agency
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    } 
    
    const { agencyId, step } = await request.json();
    if (!agencyId || !step) {
      return NextResponse.json({ error: 'Agency ID and step are required' }, { status: 400 });
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
    
    // Verify the agency belongs to the user's team
    const agencyExists = await db.query.agencies.findFirst({
      where: and(
        eq(agencies.id, Number(agencyId)),
        eq(agencies.teamId, team.id)
      )
    });

    if (!agencyExists) {
      return NextResponse.json({ error: 'Agency not found or access denied' }, { status: 404 });
    }
    
    // Check if a welcome step already exists for this agency
    const existingStep = await db.query.welcomeSteps.findFirst({
      where: eq(welcomeSteps.agencyId, Number(agencyId))
    });

    let result;
    
    if (existingStep) {
      // Update existing welcome step
      [result] = await db
        .update(welcomeSteps)
        .set({
          welcomeStep: step,
          updatedAt: new Date()
        })
        .where(eq(welcomeSteps.agencyId, Number(agencyId)))
        .returning();
    } else {
      // Create new welcome step
      [result] = await db
        .insert(welcomeSteps)
        .values({
          agencyId: Number(agencyId),
          welcomeStep: step,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving welcome step:', error);
    return NextResponse.json({ error: 'Failed to save welcome step' }, { status: 500 });
  }
}

