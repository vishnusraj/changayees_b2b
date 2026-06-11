'use client';

import { useEffect } from 'react';

/** Root error boundary — catches errors in the root layout itself. */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[global error]', error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          minHeight: '100vh',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          padding: '1rem',
          textAlign: 'center',
        }}
      >
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
          Something went wrong
        </h1>
        <p style={{ color: '#64748b', maxWidth: '28rem' }}>
          Please refresh the page. If the problem persists, contact our team.
        </p>
        <button
          onClick={reset}
          style={{
            height: '2.75rem',
            padding: '0 1.25rem',
            borderRadius: '0.5rem',
            background: '#1480c4',
            color: '#fff',
            fontWeight: 600,
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
