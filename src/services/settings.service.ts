/**
 * Settings service — key/value content for the settings-driven CMS modules
 * (General, Contact, Footer, Homepage). Node runtime only (Prisma).
 */
import { unstable_cache, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { writeAudit } from '@/services/audit.service';
import { SETTING_FALLBACKS } from '@/lib/cms/settings-schema';

const SETTINGS_TAG = 'settings';

/** Raw settings map (DB values only) — uncached, for the admin editor. */
export async function getSettingsMap(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((r) => [r.settingKey, r.settingValue ?? '']));
}

/**
 * Cached + resilient read for public pages. Cached for 5 min (invalidated on
 * save) to spare the DB on every render, and degrades to defaults if the read
 * fails — so the marketing pages never hard-crash on a transient DB issue.
 */
const getCachedSettings = unstable_cache(
  async (): Promise<Record<string, string>> => {
    try {
      const rows = await prisma.setting.findMany();
      return Object.fromEntries(
        rows.map((r) => [r.settingKey, r.settingValue ?? '']),
      );
    } catch (error) {
      console.error('[settings] read failed, falling back to defaults:', error);
      return {};
    }
  },
  ['public-settings'],
  { revalidate: 300, tags: [SETTINGS_TAG] },
);

function stripEmpty(map: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(map).filter(([, v]) => v !== null && v !== ''),
  );
}

/** Settings merged over defaults — for public reads (never missing keys). */
export async function getResolvedSettings(): Promise<Record<string, string>> {
  const stored = await getCachedSettings();
  return { ...SETTING_FALLBACKS, ...stripEmpty(stored) };
}

export async function updateSettings(
  entries: Record<string, string>,
  actorId: string,
): Promise<void> {
  for (const [settingKey, settingValue] of Object.entries(entries)) {
    await prisma.setting.upsert({
      where: { settingKey },
      update: { settingValue },
      create: { settingKey, settingValue },
    });
  }
  // Invalidate the public settings cache so edits show immediately.
  revalidateTag(SETTINGS_TAG);
  await writeAudit({
    userId: actorId,
    module: 'settings',
    action: 'update',
    newValue: { keys: Object.keys(entries) },
  });
}
