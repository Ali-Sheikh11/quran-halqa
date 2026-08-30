import { createClient } from "@/lib/supabase/server";
import { loadSettings } from "@/lib/supabase/settings";
import SessionManager from "@/components/admin/SessionManager";

export const metadata = { title: "إدارة الدورة | منارة القرآن" };

export default async function SessionPage() {
  const supabase = createClient();
  const [settings, { count }] = await Promise.all([
    loadSettings(supabase),
    supabase.from("students").select("*", { count: "exact", head: true }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-verse text-2xl font-bold text-emerald-800">
        🏁 إدارة الدورة
      </h1>
      <SessionManager settings={settings} studentsCount={count ?? 0} />
    </div>
  );
}
