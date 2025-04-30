import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { questionsSets, agencies } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { QuestionSet } from '@/lib/types/questions';

// Get questions set for an agency
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agencyId = searchParams.get('agencyId');
    const apiKey = searchParams.get('apiKey');
    
    // If API key is provided, use it to get the agency and its questions
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

      // Get questions for this agency
      const questionsSet = await db.query.questionsSets.findFirst({
        where: eq(questionsSets.agencyId, agency.id)
      });

      if (!questionsSet) {
        // Return empty questions array if no set exists yet
        return NextResponse.json({ 
          id: null,
          agencyId: agency.id,
          questions: []
        });
      }

      return NextResponse.json(questionsSet);
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

    // Get the questions set
    const questionsSet = await db.query.questionsSets.findFirst({
      where: eq(questionsSets.agencyId, parseInt(agencyId))
    });

    if (!questionsSet) {
      // Return empty questions array if no set exists yet
      return NextResponse.json({ 
        id: null,
        agencyId: parseInt(agencyId),
        questions: []
      });
    }

    return NextResponse.json(questionsSet);
  } catch (error) {
    console.error('Error fetching questions set:', error);
    return NextResponse.json({ error: 'Failed to fetch questions set' }, { status: 500 });
  }
}

// Create or update questions set
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

    const data = await request.json() as QuestionSet;
    
    if (!data.agencyId) {
      return NextResponse.json({ error: 'Agency ID is required' }, { status: 400 });
    }

    // Verify the agency belongs to the user's team
    const agencyExists = await db.query.agencies.findFirst({
      where: and(
        eq(agencies.id, data.agencyId),
        eq(agencies.teamId, team.id)
      )
    });

    if (!agencyExists) {
      return NextResponse.json({ error: 'Agency not found or access denied' }, { status: 404 });
    }

    // Check if a questions set already exists for this agency
    const existingSet = await db.query.questionsSets.findFirst({
      where: eq(questionsSets.agencyId, data.agencyId)
    });

    let result;
    
    if (existingSet) {
      // Update existing set
      [result] = await db
        .update(questionsSets)
        .set({
          questions: data.questions,
          updatedAt: new Date()
        })
        .where(eq(questionsSets.id, existingSet.id))
        .returning();
    } else {
      // Create new set
      [result] = await db
        .insert(questionsSets)
        .values({
          agencyId: data.agencyId,
          questions: data.questions,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error saving questions set:', error);
    return NextResponse.json({ error: 'Failed to save questions set' }, { status: 500 });
  }
} 