import { verifyEmail } from '@/lib/email/service';
import { redirect } from 'next/navigation';
import { Swords } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  // In Next.js 15+, searchParams is a Promise that needs to be awaited
  const { token } = await searchParams;
  
  if (!token) {
    return redirect('/');
  }
  
  const result = await verifyEmail(token);
  
  return (
    <div className="min-h-[100dvh] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Swords className="h-12 w-12 text-orange-500" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Email Verification
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            {result.success ? (
              <>
                <p className="text-green-500 text-xl mb-4">
                  Your email has been verified successfully!
                </p>
                <p className="mb-6">
                  You can now access all features of the application.
                </p>
              </>
            ) : (
              <>
                <p className="text-red-500 text-xl mb-4">
                  {result.message}
                </p>
                <p className="mb-6">
                  Please request a new verification link from your account settings.
                </p>
              </>
            )}
            
            <div className="mt-6">
              <Link href="/dashboard" passHref>
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Go to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 