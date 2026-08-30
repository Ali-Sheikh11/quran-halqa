import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppSettings, SettingKey } from "@/lib/settings";
import { DEFAULT_SETTINGS } from "@/lib/settings";

/** تحميل جميع الإعدادات من Supabase */
export async function loadSettings(
  supabase: SupabaseClient
): Promise<AppSettings> {
  const { data, error } = await supabase
    .from("app_settings")
    .select("key, value");

  if (error || !data) return DEFAULT_SETTINGS;

  const settings = { ...DEFAULT_SETTINGS };
  for (const row of data) {
    const key = row.key as SettingKey;
    if (key in settings) {
      (settings as Record<string, unknown>)[key] = row.value;
    }
  }
  return settings;
}

/** تحديث إعداد واحد */
export async function updateSetting(
  supabase: SupabaseClient,
  key: SettingKey,
  value: unknown
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from("app_settings")
    .update({ value, updated_at: new Date().toISOString() })
    .eq("key", key);

  return { error: error?.message ?? null };
}

/** تسجيل عملية إدارية في السجل */
export async function logAdminAction(
  supabase: SupabaseClient,
  action: string,
  details: Record<string, unknown> = {},
  performedBy?: string
): Promise<void> {
  await supabase.from("admin_logs").insert({
    action,
    details,
    performed_by: performedBy ?? null,
  });
}
