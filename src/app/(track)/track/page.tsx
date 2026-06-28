import type { Metadata } from 'next';
import { TrackSearchClient } from '@/components/tracking/track-search-client';

export const metadata: Metadata = {
  title: 'Track your order',
  description: 'Track your Changayees order with your Order ID and phone number.',
  robots: { index: false },
};

export default function TrackOrderPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <span className="text-overline inline-flex w-fit items-center gap-1.5 rounded-full border border-brand/20 bg-brand-subtle px-3 py-1 text-brand">
          <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
          Live tracking
        </span>
        <h1 className="text-h2">Track your order</h1>
        <p className="text-body-sm text-muted-foreground">
          Enter your Order ID and the phone number on the order to view live
          production progress. No login required.
        </p>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-premium md:p-6">
        <TrackSearchClient />
      </div>
    </div>
  );
}
