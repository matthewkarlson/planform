import { NextRequest, NextResponse } from 'next/server';
import { welcomeSteps } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { getTeamForUser, getUser } from '@/lib/db/queries';


//Get the welcome step for an agency
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const agencyId = searchParams.get('agencyId');
  
    if (!agencyId) {
      return NextResponse.json({ error: 'Agency ID is required' }, { status: 400 });
    }
  
    const welcomeStep = await db.query.welcomeSteps.findFirst({
      where: eq(welcomeSteps.agencyId, Number(agencyId)),
    });
    const welcomeStepData = welcomeStep ? welcomeStep.welcomeStep : null;
    // Return the result (could be null if not found)
    return NextResponse.json(welcomeStepData);
  }
  

//Update the welcome step for an agency
export async function POST(request: NextRequest) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  } 
  const { agencyId, step } = await request.json();
  if (!agencyId || !step) {
    return NextResponse.json({ error: 'Agency ID and step are required' }, { status: 400 });
  }
  //Need to make sure the user is a member of the team that owns the agency
  const team = await getTeamForUser();
  if (!team) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const welcomeStep = await db.update(welcomeSteps).set({
    welcomeStep: step,
  }).where(eq(welcomeSteps.agencyId, Number(agencyId)));

  return NextResponse.json(welcomeStep);
}

