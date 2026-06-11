import { makeCollectionRoutes } from '@/lib/api/crud';
import { testimonialService } from '@/features/cms/testimonial.service';
import { testimonialCreateSchema } from '@/lib/validation/cms';

export const dynamic = 'force-dynamic';

export const { GET, POST } = makeCollectionRoutes({
  service: testimonialService,
  perms: { view: 'testimonials.view', create: 'testimonials.create', update: 'testimonials.update', remove: 'testimonials.delete' },
  createSchema: testimonialCreateSchema,
});
