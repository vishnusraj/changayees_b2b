import { makeCollectionRoutes } from '@/lib/api/crud';
import { caseStudyService } from '@/features/cms/case-study.service';
import { caseStudyCreateSchema } from '@/lib/validation/cms';

export const dynamic = 'force-dynamic';

export const { GET, POST } = makeCollectionRoutes({
  service: caseStudyService,
  perms: { view: 'case_studies.view', create: 'case_studies.create', update: 'case_studies.update', remove: 'case_studies.delete' },
  createSchema: caseStudyCreateSchema,
});
