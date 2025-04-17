"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteIdeaButtonProps {
  ideaId: string;
}

export default function DeleteIdeaButton({ ideaId }: DeleteIdeaButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this idea? This action cannot be undone.')) {
      try {
        setIsDeleting(true);
        const response = await fetch(`/api/ideas/${ideaId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete idea');
        }

        router.refresh();
      } catch (error) {
        console.error('Error deleting idea:', error);
        alert('Failed to delete idea. Please try again.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="bg-red-600 hover:bg-red-700 text-white px-2 py-1 text-sm font-medium rounded border border-red-700 transition-colors"
      aria-label="Delete idea"
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
} 