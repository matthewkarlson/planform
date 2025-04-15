'use client';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Zap } from 'lucide-react';
import { useActionState } from 'react';
import { User } from '@/lib/db/schema';

type ActionState = {
  error?: string;
  success?: string;
};

type SettingsProps = {
  userData: User;
};

export function Settings({ userData }: SettingsProps) {
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
                  User Tier: {userData.isPremium ? 'Premium' : 'Free'}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
              Purchase runs to unlock premium tier insights and deeper analysis.
              </p>
                <Button variant="outline" onClick={() => window.location.href = '/pricing'}>
                  Purchase Runs
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Arena Runs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 rounded-full p-2">
                <Zap className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <p className="font-medium">Remaining Runs</p>
                <p className="text-2xl font-bold">{userData.remainingRuns || 0}</p>
              </div>
            </div>
            <Button variant="outline" className="rounded-full" onClick={() => window.location.href = '/arena'}>
              Start New Run
            </Button>
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
    </section>
  );
}
