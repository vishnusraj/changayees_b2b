'use client';

import * as React from 'react';
import { trackEvent } from '@/lib/analytics-client';

/** Fires a product_viewed beacon on mount (client-side, dedup-friendly). */
export function ProductTracker({ slug }: { slug: string }) {
  React.useEffect(() => {
    trackEvent('product_viewed', { slug });
  }, [slug]);
  return null;
}
