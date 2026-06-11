import { type NextRequest } from 'next/server';
import { z } from 'zod';
import { withApi } from '@/lib/api/route';
import { ok, message } from '@/lib/api/response';
import { readJson } from '@/lib/api/request';
import { authorize } from '@/lib/api/guards';
import { getSettingsMap, updateSettings } from '@/services/settings.service';

export const dynamic = 'force-dynamic';

/** GET /api/v1/cms/settings — all stored settings. */
export const GET = withApi(async (req: NextRequest) => {
  await authorize(req, 'settings.view');
  return ok(await getSettingsMap());
});

/** PUT /api/v1/cms/settings — upsert a map of settings. */
export const PUT = withApi(async (req: NextRequest) => {
  const auth = await authorize(req, 'settings.update');
  const body = z.record(z.string()).parse(await readJson(req));
  await updateSettings(body, auth.userId);
  return message('Settings saved');
});
