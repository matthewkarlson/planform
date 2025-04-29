import { redirect } from 'next/navigation';
import { Settings } from './settings';
import { getUser, getTeamForUser, getTeamMembers } from '@/lib/db/queries';

export default async function SettingsPage() {
  const user = await getUser();

  if (!user) {
    redirect('/sign-in');
  }

  const team = await getTeamForUser();
  if (!team) {
    redirect('/sign-in');
  }

  const teamMembers = await getTeamMembers(team.id);

  return <Settings userData={user} teamData={team} teamMembers={teamMembers} />;
}
