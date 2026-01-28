"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorDisplayProps {
  error: Error | { message: string } | string;
  onRetry?: () => void;
  className?: string;
  title?: string;
}

export function ErrorDisplay({
  error,
  onRetry,
  className,
  title = "Something went wrong",
}: ErrorDisplayProps) {
  const errorMessage = typeof error === "string" ? error : error.message;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className
      )}
    >
      <AlertCircle className="h-12 w-12 text-destructive mb-4" />
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-md">{errorMessage}</p>
      {onRetry && (
        <Button onClick={onRetry} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
}

interface PageErrorProps {
  error: Error | { message: string } | string;
  onRetry?: () => void;
}

export function PageError({ error, onRetry }: PageErrorProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <ErrorDisplay error={error} onRetry={onRetry} />
    </div>
  );
}
