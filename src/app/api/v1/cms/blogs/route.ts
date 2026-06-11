import { makeCollectionRoutes } from '@/lib/api/crud';
import { blogService } from '@/features/cms/blog.service';
import { blogCreateSchema } from '@/lib/validation/cms';

export const dynamic = 'force-dynamic';

export const { GET, POST } = makeCollectionRoutes({
  service: blogService,
  perms: { view: 'blogs.view', create: 'blogs.create', update: 'blogs.update', remove: 'blogs.delete' },
  createSchema: blogCreateSchema,
});
