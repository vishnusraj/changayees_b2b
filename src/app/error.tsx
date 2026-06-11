'use client';

import { useEffect } from 'react';
import Link from 'next/link';

/** Route-segment error boundary — friendly, recoverable. */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface for observability (Sentry can hook here later).
    console.error('[app error]', error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-sm font-semibold text-primary">Something went wrong</p>
      <h1 className="text-2xl font-bold text-foreground">
        We hit an unexpected error
      </h1>
      <p className="max-w-md text-muted-foreground">
        Please try again. If the problem persists, contact our team and we&apos;ll
        sort it out.
      </p>
      <div className="flex gap-3 pt-2">
        <button
          onClick={reset}
          className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-lg border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
