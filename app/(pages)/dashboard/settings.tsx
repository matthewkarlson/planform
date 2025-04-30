'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap, UserPlus, User as UserIcon, Users } from 'lucide-react';
import { User, Team, TeamMember } from '@/lib/db/schema';
import { inviteTeamMember, removeTeamMember } from '@/app/(login)/actions';
import { useState } from 'react';
import { createPortalSessionAction } from '@/lib/payments/actions';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  const [isInviting, setIsInviting] = useState(false);
  const [formErrors, setFormErrors] = useState<{email?: string}>({});
  
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
    // Reset errors and messages
    setFormErrors({});
    setInviteMessage({});
    
    // Validate email
    if (!inviteEmail) {
      setFormErrors({ email: 'Email is required' });
      return;
    }
    
    if (!/^\S+@\S+\.\S+$/.test(inviteEmail)) {
      setFormErrors({ email: 'Please enter a valid email address' });
      return;
    }
    
    try {
      setIsInviting(true);
      
      // Create FormData object properly
      const formData = new FormData();
      formData.append('email', inviteEmail);
      formData.append('role', inviteRole);
      
      const result = await inviteTeamMember({ email: inviteEmail, role: inviteRole }, formData);
      
      // Clear form on success
      if (result.success) {
        setInviteMessage({ success: result.success });
        setInviteEmail('');
        setInviteRole('member');
      } 
      // Handle specific errors
      else if (result.error) {
        if (result.error.includes('required')) {
          setFormErrors({ email: 'Email is required' });
        } else {
          setInviteMessage({ error: result.error });
        }
      }
    } catch (error) {
      console.error('Invitation error:', error);
      setInviteMessage({ error: 'Failed to send invitation. Please try again.' });
    } finally {
      setIsInviting(false);
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
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="invite-email">Invite a Team Member</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="md:col-span-2">
                    <Input
                      id="invite-email"
                      type="email"
                      placeholder="Email address"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && (
                      <p className="text-sm text-red-500 mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div className="md:col-span-1">
                    <Select value={inviteRole} onValueChange={(value) => setInviteRole(value as 'member' | 'owner')}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-1">
                    <Button className="w-full" onClick={handleInvite} disabled={isInviting}>
                      {isInviting ? "Inviting..." : (
                        <>
                          <UserPlus className="h-4 w-4 mr-2" />
                          Invite
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {inviteMessage.success && (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">
                  {inviteMessage.success}
                </AlertDescription>
              </Alert>
            )}
            {inviteMessage.error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {inviteMessage.error}
                </AlertDescription>
              </Alert>
            )}
          
          <div className="space-y-4 mt-6">
            <h3 className="text-sm font-medium">Current Team Members</h3>
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
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
