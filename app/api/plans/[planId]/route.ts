import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { plans, teamMembers, agencies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

type Params = Promise<{ planId: string }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { planId } = await params;
    const planIdNum = parseInt(planId);
    
    if (isNaN(planIdNum)) {
      return NextResponse.json({ error: 'Invalid plan ID' }, { status: 400 });
    }
    
    // Get the plan with the agency info
    const plan = await db.query.plans.findFirst({
      where: eq(plans.id, planIdNum),
      with: {
        client: true,
        agency: true
      }
    });
    
    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 });
    }
    
    // Check if user has access to this plan via agency
    const agencyId = plan.agencyId;
    if (!agencyId) {
      return NextResponse.json({ error: 'Invalid plan data' }, { status: 400 });
    }

    // Check if the user has access to this agency
    // First, check if they are directly associated with the agency
    if (user.agencyId === agencyId) {
      // User is directly associated with this agency - allow access
    } else {
      // Check if user is a member of a team that owns this agency
      const agency = plan.agency;

      if (!agency) {
        return NextResponse.json({ error: 'Agency not found' }, { status: 404 });
      }

      if (agency.teamId) {
        // Check if the user is a member of the team that owns this agency
        const userTeamMembership = await db.query.teamMembers.findFirst({
          where: and(
            eq(teamMembers.userId, user.id),
            eq(teamMembers.teamId, agency.teamId)
          )
        });

        if (!userTeamMembership) {
          // User is not a member of the team that owns this agency
          return NextResponse.json({ error: 'Unauthorized access to this plan' }, { status: 403 });
        }
      } else {
        // Agency has no team, and user is not directly associated
        return NextResponse.json({ error: 'Unauthorized access to this plan' }, { status: 403 });
      }
    }
    
    // Return the plan data
    return NextResponse.json(plan.planData);
  } catch (error) {
    console.error('Error fetching plan:', error);
    return NextResponse.json(
      { error: 'Failed to fetch plan' },
      { status: 500 }
    );
  }
} 