import { createClient } from "@/lib/supabase/server";
import { loadSettings } from "@/lib/supabase/settings";
import SettingsManager from "@/components/admin/SettingsManager";

export const metadata = { title: "الإعدادات | منارة القرآن" };

export default async function SettingsPage() {
  const supabase = createClient();
  const settings = await loadSettings(supabase);
  return (
    <div className="space-y-6">
      <h1 className="font-verse text-2xl font-bold text-emerald-800">
        ⚙️ الإعدادات
      </h1>
      <SettingsManager settings={settings} />
    </div>
  );
}
