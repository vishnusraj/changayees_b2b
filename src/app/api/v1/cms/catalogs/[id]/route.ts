import { makeItemRoutes } from '@/lib/api/crud';
import { catalogAdminService } from '@/features/cms/catalog-admin.service';
import { catalogUpdateSchema } from '@/lib/validation/cms';

export const { GET, PUT, DELETE } = makeItemRoutes({
  service: catalogAdminService,
  perms: { view: 'catalogs.view', create: 'catalogs.create', update: 'catalogs.update', remove: 'catalogs.delete' },
  updateSchema: catalogUpdateSchema,
});
