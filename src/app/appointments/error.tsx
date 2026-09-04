"use client";

import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "lucide-react";

export default function AppointmentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircleIcon className="size-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Could not load appointment booking</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          There was an issue loading the booking system. Please try again.
        </p>
        <Button onClick={reset} className="bg-primary hover:bg-primary/90">
          Try again
        </Button>
      </div>
    </div>
  );
}

