'use server'

import { randomBytes } from 'crypto';
import { db } from '@/lib/db/drizzle';
import { waitlistEntries } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { sendWaitlistVerificationEmail } from '@/lib/email/service';
import { z } from 'zod';

const waitlistSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

export async function joinWaitlist(formData: FormData) {
  const email = formData.get('email') as string;
  
  // Validate email
  const validation = waitlistSchema.safeParse({ email });
  if (!validation.success) {
    return {
      success: false,
      message: validation.error.errors[0].message,
    };
  }

  try {
    // Check if the email is already in the waitlist
    const existingEntry = await db.query.waitlistEntries.findFirst({
      where: eq(waitlistEntries.email, email),
    });

    if (existingEntry) {
      if (existingEntry.isVerified) {
        return {
          success: false,
          message: 'This email is already on our waitlist.',
        };
      } else {
        // Email exists but not verified, send another verification email
        const token = existingEntry.verificationToken || randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        await db.update(waitlistEntries)
          .set({
            verificationToken: token,
            verificationTokenExpiresAt: expiresAt,
          })
          .where(eq(waitlistEntries.id, existingEntry.id));
          
        await sendWaitlistVerificationEmail(email, token);
          
        return {
          success: true,
          message: 'We have sent you another verification email. Please check your inbox.',
        };
      }
    }

    // Create a new waitlist entry
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await db.insert(waitlistEntries).values({
      email,
      verificationToken: token,
      verificationTokenExpiresAt: expiresAt,
    });

    // Send verification email
    await sendWaitlistVerificationEmail(email, token);

    return {
      success: true,
      message: 'Thank you for joining our waitlist! Please check your email to verify your address.',
    };
  } catch (error) {
    console.error('Error joining waitlist:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    };
  }
}

export async function verifyWaitlistEmail(token: string) {
  try {
    // Find the token in the database
    const entry = await db.query.waitlistEntries.findFirst({
      where: eq(waitlistEntries.verificationToken, token),
    });
    
    if (!entry) {
      return { 
        success: false, 
        message: "Invalid verification link" 
      };
    }
    
    // Check if the token has expired
    if (entry.verificationTokenExpiresAt && new Date() > entry.verificationTokenExpiresAt) {
      return { 
        success: false, 
        message: "Verification link has expired" 
      };
    }
    
    // Mark as verified
    await db.update(waitlistEntries)
      .set({ 
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null 
      })
      .where(eq(waitlistEntries.id, entry.id));
      
    return { 
      success: true, 
      message: "Thank you! Your email has been verified." 
    };
  } catch (error) {
    console.error('Error verifying waitlist email:', error);
    return {
      success: false,
      message: 'Something went wrong. Please try again later.',
    };
  }
} 