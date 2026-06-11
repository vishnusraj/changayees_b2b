import { makeCollectionRoutes } from '@/lib/api/crud';
import { productAdminService } from '@/features/cms/product-admin.service';
import { productCreateSchema } from '@/lib/validation/cms';

export const dynamic = 'force-dynamic';

export const { GET, POST } = makeCollectionRoutes({
  service: productAdminService,
  perms: { view: 'products.view', create: 'products.create', update: 'products.update', remove: 'products.delete' },
  createSchema: productCreateSchema,
});
