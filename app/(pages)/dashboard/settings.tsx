'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, UserPlus, User as UserIcon, Users } from 'lucide-react';
import { User, Team, TeamMember } from '@/lib/db/schema';
import { inviteTeamMember, removeTeamMember } from '@/app/(login)/actions';
import { useState } from 'react';
import { createPortalSessionAction } from '@/lib/payments/actions';

type ActionState = {
  error?: string;
  success?: string;
};

type SettingsProps = {
  userData: User;
  teamData: Team;
  teamMembers: {
    member: TeamMember;
    user: {
      id: number;
      name: string | null;
      email: string;
    };
  }[];
};

export function Settings({ userData, teamData, teamMembers }: SettingsProps) {
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'member' | 'owner'>('member');
  const [inviteMessage, setInviteMessage] = useState<ActionState>({});
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false);
  
  const handleSubscriptionManagement = async () => {
    // If the team has a subscription, go to Stripe portal. Otherwise, go to pricing
    if (teamData.stripeCustomerId && teamData.planName && teamData.planName.toLowerCase() !== 'free') {
      try {
        setIsLoadingSubscription(true);
        const session = await createPortalSessionAction();
        window.location.href = session.url;
      } catch (error) {
        console.error("Failed to create portal session:", error);
        window.location.href = '/pricing';
      } finally {
        setIsLoadingSubscription(false);
      }
    } else {
      window.location.href = '/pricing';
    }
  };

  const handleInvite = async () => {
    const result = await inviteTeamMember({ email: inviteEmail, role: inviteRole }, new FormData());
    if (result.error) {
      setInviteMessage({ error: result.error });
    } else if (result.success) {
      setInviteMessage({ success: result.success });
      setInviteEmail('');
    }
  };
  
  const handleRemoveMember = async (memberId: number) => {
    await removeTeamMember({ memberId }, new FormData());
  };
  
  return (
    <section className="flex-1 p-4 lg:p-8">
      <h1 className="text-lg lg:text-2xl font-medium mb-6">Account Settings</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Subscription</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
              <div className="mb-4 sm:mb-0">
                <p className="font-medium">
                  Team: {teamData.name}
                </p>
                <p className="font-medium">
                  Status: {teamData.subscriptionStatus || 'Free'}
                </p>
                {teamData.planName && (
                  <p className="text-sm text-muted-foreground">
                    Plan: {teamData.planName}
                  </p>
                )}
              </div>
              <Button 
                variant="outline" 
                onClick={handleSubscriptionManagement}
                disabled={isLoadingSubscription}
              >
                {isLoadingSubscription ? 'Loading...' : 'Manage Subscription'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={`/placeholder.svg?height=32&width=32`}
                alt="User avatar"
              />
              <AvatarFallback>
                {userData?.name?.charAt(0) || userData?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {userData?.name || userData?.email || 'User'}
              </p>
              <p className="text-sm text-muted-foreground">
                {userData?.email}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Team Members</CardTitle>
          <div className="flex items-center space-x-2">
            <input
              type="email"
              placeholder="Email address"
              className="px-2 py-1 border rounded"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
            <select 
              className="px-2 py-1 border rounded"
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as 'member' | 'owner')}
            >
              <option value="member">Member</option>
              <option value="owner">Owner</option>
            </select>
            <Button size="sm" onClick={handleInvite}>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inviteMessage.success && (
            <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
              {inviteMessage.success}
            </div>
          )}
          {inviteMessage.error && (
            <div className="mb-4 p-2 bg-red-100 text-red-800 rounded">
              {inviteMessage.error}
            </div>
          )}
          
          <div className="space-y-4">
            {teamMembers.map(({ member, user }) => (
              <div key={member.id} className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center space-x-3">
                  <div className="bg-gray-100 rounded-full p-2">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                  </div>
                  <div>
                    <p className="font-medium">{user.name || user.email}</p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <p className="text-xs text-gray-400 capitalize">{member.role}</p>
                  </div>
                </div>
                {userData.id !== user.id && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
