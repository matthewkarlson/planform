'use client';

import { Suspense, use } from 'react';
import { Login } from '../login';
import { useUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default function SignInPage() {
  const { userPromise } = useUser();
  const user = use(userPromise);
  
  // Redirect to dashboard if already logged in
  if (user) {
    redirect('/dashboard');
  }
  
  return (
    <Suspense>
      <Login mode="signin" />
    </Suspense>
  );
}
