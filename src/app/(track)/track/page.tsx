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
      <div className="space-y-1">
        <h1 className="text-h2">Track your order</h1>
        <p className="text-body-sm text-muted-foreground">
          Enter your Order ID and the phone number on the order to view live
          production progress. No login required.
        </p>
      </div>

      <TrackSearchClient />
    </div>
  );
}
