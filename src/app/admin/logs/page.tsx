import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "سجل العمليات | منارة القرآن" };

export default async function LogsPage() {
  const supabase = createClient();
  const { data: logs } = await supabase
    .from("admin_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div className="space-y-6">
      <h1 className="font-verse text-2xl font-bold text-emerald-800">
        📋 سجل العمليات
      </h1>

      {!logs || logs.length === 0 ? (
        <p className="text-center text-sm text-night/50">لا توجد عمليات مسجّلة بعد.</p>
      ) : (
        <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm">
          <div className="divide-y divide-emerald-50">
            {logs.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                <div>
                  <p className="text-sm font-bold text-night/80">{log.action}</p>
                  {log.performed_by && (
                    <p className="text-[11px] text-night/40">{log.performed_by}</p>
                  )}
                </div>
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
