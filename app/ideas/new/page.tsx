import IdeaIntakeForm from '@/components/IdeaIntakeForm';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export default async function NewIdeaPage() {
  const user = await getUser();
  
  // Redirect if not logged in
  if (!user) {
    redirect('/login');
  }
  
  // Redirect to pricing page if no runs remaining
  if (!user.remainingRuns || user.remainingRuns <= 0) {
    redirect('/pricing');
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Submit a New Idea</h1>
          <p className="text-gray-600">
            Fill out the details of your idea to start the refinement process.
          </p>
        </header>

        <IdeaIntakeForm />
      </div>
    </div>
  );
} 