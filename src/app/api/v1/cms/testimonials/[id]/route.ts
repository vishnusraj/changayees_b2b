import { makeItemRoutes } from '@/lib/api/crud';
import { testimonialService } from '@/features/cms/testimonial.service';
import { testimonialUpdateSchema } from '@/lib/validation/cms';

export const { GET, PUT, DELETE } = makeItemRoutes({
  service: testimonialService,
  perms: { view: 'testimonials.view', create: 'testimonials.create', update: 'testimonials.update', remove: 'testimonials.delete' },
  updateSchema: testimonialUpdateSchema,
});
