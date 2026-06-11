'use client';

import { useParams } from 'next/navigation';
import { CMS_RESOURCES } from '@/components/admin/cms/resources';
import { ResourceList } from '@/components/admin/cms/resource-list';
import { EmptyState } from '@/components/feedback/empty-state';

export default function CmsModuleListPage() {
  const params = useParams();
  const moduleSlug = typeof params.module === 'string' ? params.module : '';
  const config = CMS_RESOURCES[moduleSlug];

  if (!config) {
    return <EmptyState title="Unknown content module" />;
  }
  return <ResourceList config={config} />;
}
