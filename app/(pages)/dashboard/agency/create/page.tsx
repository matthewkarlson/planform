import { redirect } from 'next/navigation';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import AgencyCreationForm from './agency-form';

type Params = Promise<{}>;

export default async function CreateAgencyPage({ params }: { params: Params }) {
  const user = await getUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  const team = await getTeamForUser();
  if (!team) {
    redirect('/sign-in');
  }
  
  // Check if the team has a paid subscription
  const hasPaidSubscription = team.subscriptionStatus === 'active' || 
                            team.subscriptionStatus === 'trialing';
  
  if (!hasPaidSubscription) {
    redirect('/pricing?message=subscription_required');
  }
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Agency</h1>
      <AgencyCreationForm teamId={team.id} userId={user.id} />
    </div>
  );
} 