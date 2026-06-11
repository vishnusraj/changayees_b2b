'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  TrackingSearch,
  type TrackingSearchValues,
} from './tracking-search';

/**
 * TrackSearchClient — wires the TrackingSearch form to the verify API and
 * redirects to the tokenized tracking view on success.
 */
export function TrackSearchClient() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | undefined>();

  const onSubmit = async ({ trackingId, phone }: TrackingSearchValues) => {
    setLoading(true);
    setError(undefined);
    try {
      const res = await fetch('/api/v1/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId, phone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message ?? 'Order not found');
      }
      router.push(`/track/${data.data.trackingToken}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order not found');
      setLoading(false);
    }
  };

  return <TrackingSearch onSubmit={onSubmit} loading={loading} error={error} />;
}
