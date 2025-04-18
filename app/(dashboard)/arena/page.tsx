import Link from 'next/link';
import { db } from '@/lib/db/drizzle';
import { ideas } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { desc } from 'drizzle-orm';

export default async function ArenaPage() {
  const user = await getUser();
  
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Please Sign In</h2>
          <p className="mb-6">You need to be signed in to access the Idea Arena.</p>
          <Link 
            href="/login" 
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  // Fetch user's ideas
  const userIdeas = await db.query.ideas.findMany({
    where: (ideas, { eq }) => eq(ideas.ownerId, user.id),
    orderBy: [desc(ideas.createdAt)],
  });

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Idea Arena</h1>
          <p className="text-gray-600">
            Refine your business ideas through conversations with virtual persona experts.
          </p>
        </header>

        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Your Ideas</h2>
          <Link
            href="/ideas/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            + New Idea
          </Link>
        </div>

        {userIdeas.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-12 text-center border border-gray-200">
            <h3 className="text-xl font-semibold mb-3">No ideas yet</h3>
            <p className="text-gray-600 mb-6">
              Submit your first idea to get started with the Idea Arena pipeline.
            </p>
            <Link
              href="/ideas/new"
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 inline-block"
            >
              Create Your First Idea
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {userIdeas.map((idea) => (
              <div
                key={idea.id}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{idea.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{idea.rawIdea}</p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {new Date(idea.createdAt!).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/ideas/${idea.id}/customer`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Continue →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-16 bg-blue-50 rounded-lg p-8 border border-blue-100">
          <h2 className="text-2xl font-semibold mb-4">About the Idea Arena</h2>
          <p className="mb-4">
            The Idea Arena helps you refine your business ideas through conversations with specialized AI personas:
          </p>
          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="font-semibold mb-2">👤 Jordan (Customer)</div>
              <p className="text-sm text-gray-600">
                Validates whether your idea solves a real pain point and if people would pay for it.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="font-semibold mb-2">🎨 Ava (Designer)</div>
              <p className="text-sm text-gray-600">
                Helps define the minimum viable product by focusing on core features.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="font-semibold mb-2">📊 Zeke (Marketer)</div>
              <p className="text-sm text-gray-600">
                Identifies go-to-market strategies and experiments to validate assumptions.
              </p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <div className="font-semibold mb-2">💰 Morgan (VC)</div>
              <p className="text-sm text-gray-600">
                Evaluates business potential and provides an investment-worthiness score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
