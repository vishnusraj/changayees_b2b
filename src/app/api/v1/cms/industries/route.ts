import { makeCollectionRoutes } from '@/lib/api/crud';
import { industryAdminService } from '@/features/cms/industry-admin.service';
import { industryCreateSchema } from '@/lib/validation/cms';

export const dynamic = 'force-dynamic';

export const { GET, POST } = makeCollectionRoutes({
  service: industryAdminService,
  perms: { view: 'industries.view', create: 'industries.manage', update: 'industries.manage', remove: 'industries.manage' },
  createSchema: industryCreateSchema,
});
