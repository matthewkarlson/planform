'use server';

import { redirect } from 'next/navigation';
import { createCheckoutSession, createCustomerPortalSession } from './stripe';
import { getUser, getTeamForUser } from '@/lib/db/queries';

export const checkoutAction = async (formData: FormData) => {
  const user = await getUser();

  if (!user) {
    redirect('/sign-up?redirect=pricing');
  }

  const team = await getTeamForUser();
  
  if (!team) {
    redirect('/dashboard');
  }

  const priceId = formData.get('priceId') as string;
  await createCheckoutSession({ team, priceId });
};

export const createPortalSessionAction = async () => {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  const team = await getTeamForUser();
  
  if (!team) {
    redirect('/dashboard');
  }
  
  if (!team.stripeCustomerId || !team.stripeProductId) {
    redirect('/pricing');
  }
  
  const session = await createCustomerPortalSession(team);
  
  // Return only the serializable properties we need
  return {
    url: session.url,
    id: session.id
  };
};

