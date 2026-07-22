"use client"

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function CanvasError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Canvas route error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="h-screen mx-auto max-w-7xl gap-10 justify-center font-mono items-center flex flex-col text-foreground bg-background">
        <div className=" flex flex-col text-center justify-center items-center space-y-2">
            <h1 className="text-2xl text-destructive tracking-tighter "> Something Went Wrong. </h1>
            <h2 className="text-xl leading-snug text-muted-foreground tracking-tighter max-w-lg"> Unable to connect to the room server or database. Please try again later. </h2>
        </div>

        <Button variant={'default'} size={'sm'} onClick={() => reset()}>
            Try again
        </Button>
    </div>
  );
}