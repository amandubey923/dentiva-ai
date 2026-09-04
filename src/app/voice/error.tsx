"use client";

import { Button } from "@/components/ui/button";
import { AlertCircleIcon } from "lucide-react";

export default function VoiceError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-5xl mx-auto px-4 pt-24 pb-20">
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mb-4">
          <AlertCircleIcon className="size-8 text-destructive" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Voice Assistant Error</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          Could not connect to the voice assistant service. Please check your microphone permissions and try again.
        </p>
        <Button onClick={reset} className="bg-primary hover:bg-primary/90">
          Try again
        </Button>
      </div>
    </div>
  );
}

