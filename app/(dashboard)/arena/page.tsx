'use client';

import { use } from 'react';
import { Button } from '../../../components/ui/button';
import { AlertCircle, Zap } from 'lucide-react';
import { useUser } from '../../../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';

export default function ArenaPage() {
  const { userPromise } = useUser();
  const user = use(userPromise);
  
  const hasRemainingRuns = user && user.remainingRuns && user.remainingRuns > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {!hasRemainingRuns && (
        <div className="relative w-full rounded-lg border border-red-600 bg-red-50 p-4 mb-6 text-red-600">
          <AlertCircle className="absolute left-4 top-4 h-4 w-4" />
          <div className="pl-7">
            <h5 className="mb-1 font-medium leading-none tracking-tight">No Remaining Runs</h5>
            <div className="text-sm">
              You don't have any remaining idea runs. Please purchase more runs from the 
              <a href="/pricing" className="font-medium underline ml-1">pricing page</a>.
            </div>
          </div>
        </div>
      )}
      
      <Card className="shadow-md bg-white">
        <CardHeader className="pb-4 border-b">
          <CardTitle className="text-3xl font-bold text-center text-gray-900">
            Idea Arena
            <div className="text-base font-normal text-muted-foreground mt-1">
              Test your ideas against real AI agents
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="grid gap-8">
            {hasRemainingRuns ? (
              <form className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="idea-name" className="text-base">Idea Name</Label>
                    <Input
                      id="idea-name"
                      placeholder="Enter a name for your idea"
                      className="bg-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="target-audience" className="text-base">Target Audience</Label>
                    <Input
                      id="target-audience"
                      placeholder="Who would use this idea?"
                      className="bg-white"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="idea-description" className="text-base">Describe Your Idea</Label>
                  <textarea
                    id="idea-description"
                    rows={6}
                    placeholder="What problem does it solve? Who is it for? How does it work?"
                    className="flex w-full rounded-md border bg-white px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-offset-2"
                  />
                </div>
                
                <div className="flex items-center justify-between pt-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-100 rounded-full p-2">
                      <Zap className="h-5 w-5 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Remaining Runs</p>
                      <p className="text-lg font-bold">{user?.remainingRuns || 0}</p>
                    </div>
                  </div>
                
                  <Button 
                    size="lg" 
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6"
                  >
                    Test My Idea <Zap className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </form>
            ) : (
              <div className="py-16 text-center">
                <div className="inline-flex mx-auto items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
                  <Zap className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Purchase More Runs
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  You need at least one run to test your ideas. Get more runs to unlock our AI-powered analysis.
                </p>
                <Button 
                  asChild
                  size="lg" 
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <a href="/pricing">View Pricing Plans</a>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 