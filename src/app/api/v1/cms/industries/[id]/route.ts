import { makeItemRoutes } from '@/lib/api/crud';
import { industryAdminService } from '@/features/cms/industry-admin.service';
import { industryUpdateSchema } from '@/lib/validation/cms';

export const { GET, PUT, DELETE } = makeItemRoutes({
  service: industryAdminService,
  perms: { view: 'industries.view', create: 'industries.manage', update: 'industries.manage', remove: 'industries.manage' },
  updateSchema: industryUpdateSchema,
});
