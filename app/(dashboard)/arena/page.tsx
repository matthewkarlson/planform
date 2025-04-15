import { Button } from '@/components/ui/button';
import { Zap } from 'lucide-react';

export default function ArenaPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white shadow-md rounded-lg px-8 py-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Idea Arena</h1>
          <p className="mt-2 text-lg text-gray-600">Test your ideas against real AI agents</p>
        </div>
        
        <div className="bg-orange-50 p-6 rounded-lg mb-8">
          <div className="flex items-center mb-4">
            <Zap className="h-6 w-6 text-orange-500 mr-2" />
            <h2 className="text-xl font-medium text-gray-900">Submit Your Idea</h2>
          </div>
          
          <form className="space-y-6">
            <div>
              <label htmlFor="idea-name" className="block text-sm font-medium text-gray-700">
                Idea Name
              </label>
              <input
                type="text"
                id="idea-name"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder="Enter a name for your idea"
              />
            </div>
            
            <div>
              <label htmlFor="idea-description" className="block text-sm font-medium text-gray-700">
                Describe Your Idea
              </label>
              <textarea
                id="idea-description"
                rows={4}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder="What problem does it solve? Who is it for? How does it work?"
              />
            </div>
            
            <div>
              <label htmlFor="target-audience" className="block text-sm font-medium text-gray-700">
                Target Audience
              </label>
              <input
                type="text"
                id="target-audience"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                placeholder="Who would use this idea?"
              />
            </div>
            
            <div className="text-right">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white">
                Test My Idea <Zap className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 