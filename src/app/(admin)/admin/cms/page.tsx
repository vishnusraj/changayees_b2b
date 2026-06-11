import Link from 'next/link';
import { ArrowRight, Settings as SettingsIcon } from 'lucide-react';
import { CMS_MODULES } from '@/components/admin/cms/resources';

/** CMS hub — entry points to every content module. */
export default function CmsHubPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-h3">Content Management</h1>
        <p className="text-body-sm text-muted-foreground">
          Manage all site content — nothing is hardcoded.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CMS_MODULES.map((mod) => (
          <Link
            key={mod.slug}
            href={`/admin/cms/${mod.slug}`}
            className="focus-ring group flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-elevation-1 transition-shadow hover:shadow-elevation-2"
          >
            <span className="text-h4">{mod.label}</span>
            <ArrowRight
              className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5"
              aria-hidden
            />
          </Link>
        ))}

        <Link
          href="/admin/settings"
          className="focus-ring group flex items-center justify-between rounded-xl border border-border bg-card p-5 shadow-elevation-1 transition-shadow hover:shadow-elevation-2"
        >
          <span className="text-h4 flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-muted-foreground" aria-hidden />
            Settings
          </span>
          <ArrowRight
            className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </Link>
      </div>
    </div>
  );
}
