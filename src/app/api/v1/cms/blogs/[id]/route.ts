import { makeItemRoutes } from '@/lib/api/crud';
import { blogService } from '@/features/cms/blog.service';
import { blogUpdateSchema } from '@/lib/validation/cms';

export const { GET, PUT, DELETE } = makeItemRoutes({
  service: blogService,
  perms: { view: 'blogs.view', create: 'blogs.create', update: 'blogs.update', remove: 'blogs.delete' },
  updateSchema: blogUpdateSchema,
});
