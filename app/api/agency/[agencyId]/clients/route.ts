import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { clients, plans, teamMembers, agencies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/db/queries';

type Params = Promise<{ agencyId: string }>;

export async function GET(
  request: Request,
  { params }: { params: Params }
) {
  try {
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { agencyId } = await params;
    const agencyIdNum = parseInt(agencyId);
    
    if (isNaN(agencyIdNum)) {
      return NextResponse.json({ error: 'Invalid agency ID' }, { status: 400 });
    }

    // Check if the user has access to this agency
    // First, check if they are directly associated with the agency
    if (user.agencyId === agencyIdNum) {
      // User is directly associated with this agency
    } else {
      // Check if user is a member of a team that owns this agency
      const agency = await db.query.agencies.findFirst({
        where: eq(agencies.id, agencyIdNum),
      });

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
          return NextResponse.json({ error: 'Unauthorized access to this agency' }, { status: 403 });
        }
      } else {
        // Agency has no team, and user is not directly associated
        return NextResponse.json({ error: 'Unauthorized access to this agency' }, { status: 403 });
      }
    }

    // Fetch clients from the database
    const clientsList = await db.query.clients.findMany({
      where: eq(clients.agencyId, agencyIdNum),
      orderBy: (cols, { desc }) => [desc(cols.createdAt)]
    });

    // Get plans for these clients
    const plansList = await db.query.plans.findMany({
      where: eq(plans.agencyId, agencyIdNum),
    });

    // Map client plans
    const clientsWithPlans = clientsList.map(client => {
      const clientPlan = plansList.find(plan => plan.clientId === client.id);
      return {
        id: client.id,
        name: client.name,
        email: client.email,
        websiteUrl: client.websiteUrl,
        createdAt: client.createdAt,
        updatedAt: client.updatedAt,
        planId: clientPlan?.id,
        planTitle: clientPlan ? (clientPlan.planData as any)?.title || 'Growth Plan' : undefined
      };
    });

    return NextResponse.json(clientsWithPlans);
  } catch (error) {
    console.error('Error fetching clients:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
} 