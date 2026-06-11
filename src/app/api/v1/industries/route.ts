import { withApi } from '@/lib/api/route';
import { ok } from '@/lib/api/response';
import { listIndustries } from '@/features/industries/industry.service';

export const dynamic = 'force-dynamic';

/** GET /api/v1/industries — public industry list. */
export const GET = withApi(async () => {
  const industries = await listIndustries();
  return ok(industries);
});
