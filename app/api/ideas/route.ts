import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { ideas, users } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { eq } from 'drizzle-orm';

// Schema for idea creation
const ideaSchema = z.object({
  title: z.string().min(1, "Title is required"),
  rawIdea: z.string().min(1, "Idea description is required"),
  idealCustomer: z.string().min(1, "Ideal customer is required"),
  problem: z.string().min(1, "Problem statement is required"),
  currentSolutions: z.string().optional(),
  valueProp: z.string().min(1, "Value proposition is required"),
});

export async function POST(request: Request) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has remaining runs
    if (!user.remainingRuns || user.remainingRuns <= 0) {
      return NextResponse.json(
        { error: 'No remaining runs available. Please purchase more runs to create ideas.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = ideaSchema.parse(body);

    // Decrement user's remaining runs
    await db.update(users)
      .set({ 
        remainingRuns: user.remainingRuns - 1,
        updatedAt: new Date()
      })
      .where(eq(users.id, user.id));

    const [newIdea] = await db.insert(ideas).values({
      ownerId: user.id,
      title: validatedData.title,
      rawIdea: validatedData.rawIdea,
      idealCustomer: validatedData.idealCustomer,
      problem: validatedData.problem,
      currentSolutions: validatedData.currentSolutions || '',
      valueProp: validatedData.valueProp,
    }).returning({ ideaId: ideas.id });

    return NextResponse.json({ 
      ideaId: newIdea.ideaId,
      remainingRuns: user.remainingRuns - 1
    }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Error creating idea:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 