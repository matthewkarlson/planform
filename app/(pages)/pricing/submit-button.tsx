'use client';

import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type CustomVariant = ButtonVariant | "basic" | "premium";

export function SubmitButton({ 
  variant = "default" 
}: { 
  variant?: CustomVariant 
}) {
  const { pending } = useFormStatus();

  // Custom styling based on variant
  let className = "w-full py-6 rounded-full font-semibold";
  
  if (variant === "basic") {
    className += " text-black bg-gradient-to-r from-white to-blue-300 hover:from-white hover:to-blue-400";
  } else if (variant === "premium") {
    className += " text-white bg-gradient-to-r from-blue-500 to-blue-300 hover:from-blue-600 hover:to-blue-400";
  } else {
    className += " w-full"; // Default styling
  }

  // Determine which variant to pass to Button
  const buttonVariant: ButtonVariant = ["basic", "premium"].includes(variant as string) ? "default" : variant as ButtonVariant;

  return (
    <Button
      type="submit"
      disabled={pending}
      variant={buttonVariant}
      className={className}
    >
      {pending ? (
        <>
          <Loader2 className="animate-spin mr-2 h-4 w-4" />
          Processing...
        </>
      ) : (
        <>
          {variant === "basic" ? "Try for free" : "Get 14 days free"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </>
      )}
    </Button>
  );
}
