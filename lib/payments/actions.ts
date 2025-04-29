'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession } from './stripe';
import { getUser, getTeamForUser } from '@/lib/db/queries';

export const checkoutAction = async (formData: FormData) => {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const team = await getTeamForUser();
  
  if (!team) {
    redirect('/dashboard');
  }

  const priceId = formData.get('priceId') as string;
  await createCheckoutSession({ team, priceId });
};

