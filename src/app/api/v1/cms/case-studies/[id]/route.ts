import { makeItemRoutes } from '@/lib/api/crud';
import { caseStudyService } from '@/features/cms/case-study.service';
import { caseStudyUpdateSchema } from '@/lib/validation/cms';

export const { GET, PUT, DELETE } = makeItemRoutes({
  service: caseStudyService,
  perms: { view: 'case_studies.view', create: 'case_studies.create', update: 'case_studies.update', remove: 'case_studies.delete' },
  updateSchema: caseStudyUpdateSchema,
});
