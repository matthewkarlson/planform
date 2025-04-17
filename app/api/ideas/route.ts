import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/drizzle';
import { ideas } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';

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

    const body = await request.json();
    const validatedData = ideaSchema.parse(body);

    const [newIdea] = await db.insert(ideas).values({
      ownerId: user.id,
      title: validatedData.title,
      rawIdea: validatedData.rawIdea,
      idealCustomer: validatedData.idealCustomer,
      problem: validatedData.problem,
      currentSolutions: validatedData.currentSolutions || '',
      valueProp: validatedData.valueProp,
    }).returning({ ideaId: ideas.id });

    return NextResponse.json({ ideaId: newIdea.ideaId }, { status: 201 });
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