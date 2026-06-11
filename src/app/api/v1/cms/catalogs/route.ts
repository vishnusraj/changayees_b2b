import { makeCollectionRoutes } from '@/lib/api/crud';
import { catalogAdminService } from '@/features/cms/catalog-admin.service';
import { catalogCreateSchema } from '@/lib/validation/cms';

export const dynamic = 'force-dynamic';

export const { GET, POST } = makeCollectionRoutes({
  service: catalogAdminService,
  perms: { view: 'catalogs.view', create: 'catalogs.create', update: 'catalogs.update', remove: 'catalogs.delete' },
  createSchema: catalogCreateSchema,
});
