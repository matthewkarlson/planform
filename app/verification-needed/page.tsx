import { DraftinCompass, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getUser } from '@/lib/db/queries';
import { sendVerificationEmail } from '@/lib/email/service';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function VerificationNeededPage() {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  // If the user is already verified, redirect to the arena
  if (user.isVerified) {
    redirect('/arena');
  }
  
  async function resendVerificationEmail() {
    'use server';
    
    const user = await getUser();
    if (!user) {
      return;
    }
    
    try {
      await sendVerificationEmail(user.id, user.email);
      revalidatePath('/verification-needed');
    } catch (error) {
      console.error('Error sending verification email:', error);
    }
  }
  
  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <DraftinCompass className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification Required
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-16 w-16 text-orange-500" />
            </div>
            <p className="text-xl mb-4">
              Please verify your email address
            </p>
            <p className="mb-6 text-gray-600">
              Before you can access the Arena, you need to verify your email address. 
              We've sent a verification link to <strong>{user.email}</strong>.
            </p>
            
            <form action={resendVerificationEmail}>
              <Button 
                type="submit" 
                className="w-full bg-orange-600 hover:bg-orange-700 mb-4"
              >
                Resend Verification Email
              </Button>
            </form>
            
            <div className="mt-6">
              <Link href="/dashboard" passHref>
                <Button variant="outline" className="w-full">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 