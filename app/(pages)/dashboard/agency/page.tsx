import { redirect } from 'next/navigation';
import { getUser, getTeamForUser } from '@/lib/db/queries';
import { db } from '@/lib/db/drizzle';
import { agencies } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import AgencyDashboard from './agency-dashboard'

type Params = Promise<{}>;

export default async function Page({ params }: { params: Params }) {
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
  
  // Get all agencies associated with this team
  const teamAgencies = await db.query.agencies.findMany({
    where: eq(agencies.teamId, team.id),
    orderBy: (agencies, { asc }) => [asc(agencies.name)]
  });
  
  if (teamAgencies.length === 0) {
    // Redirect to agency creation page if no agencies exist
    redirect('/dashboard/agency/create');
  }
  
  return (
    <AgencyDashboard 
      user={user} 
      team={team} 
      agencies={teamAgencies}
    />
  );
}
