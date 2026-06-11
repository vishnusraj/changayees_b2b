'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * MobilePageHeader — contextual sub-page header (native back + centred title).
 * Pages render this at the top of their content for an app-like push/pop feel.
 * Mobile-only; desktop uses breadcrumbs + the standard header.
 */
export function MobilePageHeader({
  title,
  right,
  onBack,
  className,
}: {
  title: string;
  right?: React.ReactNode;
  onBack?: () => void;
  className?: string;
}) {
  const router = useRouter();
  return (
    <header
      className={cn(
        'pt-safe sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur md:hidden',
        className,
      )}
    >
      <div className="flex h-14 items-center gap-1 px-2">
        <button
          type="button"
          aria-label="Go back"
          onClick={onBack ?? (() => router.back())}
          className="focus-ring tap-target rounded-lg text-foreground"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden />
        </button>
        <h1 className="text-h4 flex-1 truncate text-center">{title}</h1>
        <span className="flex min-w-11 justify-end">{right}</span>
      </div>
    </header>
  );
}
