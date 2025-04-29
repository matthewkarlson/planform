'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

export function SubmitButton({ variant = "default" }: { variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      variant={variant}
      className="w-full"
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Processing...
        </>
      ) : (
        <>
          Start Free Trial
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
