'use client';

import { useParams } from 'next/navigation';
import { CMS_RESOURCES } from '@/components/admin/cms/resources';
import { ResourceEditor } from '@/components/admin/cms/resource-editor';
import { EmptyState } from '@/components/feedback/empty-state';

export default function CmsModuleEditorPage() {
  const params = useParams();
  const moduleSlug = typeof params.module === 'string' ? params.module : '';
  const id = typeof params.id === 'string' ? params.id : 'new';
  const config = CMS_RESOURCES[moduleSlug];

  if (!config) {
    return <EmptyState title="Unknown content module" />;
  }
  return <ResourceEditor config={config} id={id} />;
}
