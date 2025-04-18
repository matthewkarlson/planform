import IdeaIntakeForm from '@/components/IdeaIntakeForm';

export default function NewIdeaPage() {
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