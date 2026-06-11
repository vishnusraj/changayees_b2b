import type { Metadata } from 'next';
import Link from 'next/link';
import { PackageX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TrackingDashboard } from '@/components/tracking/tracking-dashboard';
import { TrackingActions } from '@/components/tracking/tracking-actions';
import { resolveByToken } from '@/features/tracking/tracking.service';

// Always render fresh — per-order, no caching (architecture §6).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Order tracking',
  robots: { index: false },
};

type Params = Promise<{ token: string }>;

export default async function TrackTokenPage({ params }: { params: Params }) {
  const { token } = await params;
  const view = await resolveByToken(token);

  if (!view) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <PackageX className="h-7 w-7" aria-hidden />
        </span>
        <div className="space-y-1">
          <h1 className="text-h3">Tracking link not found</h1>
          <p className="text-body-sm max-w-sm text-muted-foreground">
            This link may be invalid or expired. You can look up your order with
            your Order ID and phone number instead.
          </p>
        </div>
        <Button asChild>
          <Link href="/track">Track by Order ID</Link>
        </Button>
        <div className="w-full max-w-sm pt-2">
          <TrackingActions
            email="sales@changayees.com"
            whatsappMessage="Hi, I need help tracking my order."
          />
        </div>
      </div>
    );
  }

  return <TrackingDashboard view={view} />;
}
