import { createClient } from "@/lib/supabase/server";
import { loadSettings } from "@/lib/supabase/settings";

export const metadata = { title: "لوحة التحكم | منارة القرآن" };

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [
    { data: { user } },
    { data: students },
    { data: logs },
    settings,
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("students").select("*"),
    supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
    loadSettings(supabase),
  ]);

  const allStudents = students ?? [];
  const totalPoints = allStudents.reduce((s, st) => s + st.points, 0);
  const avgPoints = allStudents.length
    ? Math.round(totalPoints / allStudents.length)
    : 0;
  const top = allStudents.reduce(
    (best: { full_name: string; points: number } | null, s) =>
      !best || s.points > best.points ? s : best,
    null
  );

  const today = new Date().toISOString().split("T")[0];
  const activeToday = allStudents.filter(
    (s) => s.daily_points_date === today && s.daily_points > 0
  ).length;
  const needsAttention = allStudents.filter(
    (s) => s.daily_points_date !== today || s.daily_points === 0
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-verse text-2xl font-bold text-emerald-800">
          لوحة التحكم
        </h1>
        <p className="mt-1 text-sm text-night/60">{user?.email}</p>
      </div>

      {/* حالة الدورة */}
      <div
        className={`rounded-2xl border px-5 py-4 ${
          settings.session_ended
            ? "border-red-200 bg-red-50"
            : settings.maintenance_mode
            ? "border-amber-200 bg-amber-50"
            : "border-emerald-200 bg-emerald-50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-night/70">حالة الدورة</p>
            <p className="text-base font-bold text-emerald-800">
              {settings.session_ended
                ? "🏁 الدورة منتهية"
                : settings.maintenance_mode
                ? "🔧 وضع الصيانة"
                : `✅ ${settings.session_name} — نشطة`}
            </p>
          </div>
          {settings.session_start_date && (
            <span className="text-xs text-night/50">
              بدأت {settings.session_start_date}
            </span>
          )}
        </div>
      </div>

      {/* الإحصائيات */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {[
          { label: "عدد الطلاب", value: allStudents.length },
          { label: "إجمالي النقاط", value: totalPoints.toLocaleString() },
          { label: "متوسط النقاط", value: avgPoints },
          { label: "نشطون اليوم", value: activeToday },
          { label: "يحتاجون متابعة", value: needsAttention },
          { label: "أعلى طالب", value: top?.full_name ?? "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 shadow-sm"
          >
            <p className="truncate text-base font-bold text-emerald-800">
              {stat.value}
            </p>
            <p className="mt-1 text-[11px] text-night/50">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* آخر العمليات */}
      {logs && logs.length > 0 && (
        <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-verse text-base font-bold text-emerald-800">
            📋 آخر العمليات
          </h2>
          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-emerald-50 px-3 py-2 text-sm"
              >
                <span className="text-night/80">{log.action}</span>
                <span className="shrink-0 text-[11px] text-night/40">
                  {new Date(log.created_at).toLocaleString("ar-EG")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
