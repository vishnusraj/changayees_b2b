import { makeItemRoutes } from '@/lib/api/crud';
import { productAdminService } from '@/features/cms/product-admin.service';
import { productUpdateSchema } from '@/lib/validation/cms';

export const { GET, PUT, DELETE } = makeItemRoutes({
  service: productAdminService,
  perms: { view: 'products.view', create: 'products.create', update: 'products.update', remove: 'products.delete' },
  updateSchema: productUpdateSchema,
});
