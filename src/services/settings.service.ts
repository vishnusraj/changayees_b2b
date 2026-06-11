/**
 * Settings service — key/value content for the settings-driven CMS modules
 * (General, Contact, Footer, Homepage). Node runtime only (Prisma).
 */
import { prisma } from '@/lib/prisma';
import { writeAudit } from '@/services/audit.service';
import { SETTING_FALLBACKS } from '@/lib/cms/settings-schema';

/** Raw settings map (DB values only). */
export async function getSettingsMap(): Promise<Record<string, string>> {
  const rows = await prisma.setting.findMany();
  return Object.fromEntries(rows.map((r) => [r.settingKey, r.settingValue ?? '']));
}

/** Settings map merged over defaults — for public reads (never missing keys). */
export async function getResolvedSettings(): Promise<Record<string, string>> {
  const stored = await getSettingsMap();
  return { ...SETTING_FALLBACKS, ...stripEmpty(stored) };
}

function stripEmpty(map: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(map).filter(([, v]) => v !== null && v !== ''),
  );
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
  await writeAudit({
    userId: actorId,
    module: 'settings',
    action: 'update',
    newValue: { keys: Object.keys(entries) },
  });
}
