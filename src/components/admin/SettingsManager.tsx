"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppSettings, SettingKey } from "@/lib/settings";
import { updateSetting, logAdminAction } from "@/lib/supabase/settings";

export default function SettingsManager({ settings }: { settings: AppSettings }) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [saving, setSaving] = useState<SettingKey | null>(null);
  const [maintenanceMsg, setMaintenanceMsg] = useState(settings.maintenance_message);

  async function toggle(key: SettingKey, current: boolean) {
    setSaving(key);
    const { data: { user } } = await supabase.auth.getUser();
    await updateSetting(supabase, key, !current);
    await logAdminAction(supabase, `تغيير إعداد: ${key}`, { value: !current }, user?.email);
    router.refresh();
    setSaving(null);
  }

  async function saveMsg() {
    setSaving("maintenance_message");
    const { data: { user } } = await supabase.auth.getUser();
    await updateSetting(supabase, "maintenance_message", maintenanceMsg);
    await logAdminAction(supabase, "تغيير رسالة الصيانة", {}, user?.email);
    router.refresh();
    setSaving(null);
  }

  const toggles: Array<{ key: SettingKey; label: string; desc: string }> = [
    { key: "maintenance_mode", label: "وضع الصيانة", desc: "يحجب الموقع عن الزوار" },
    { key: "show_points_to_viewers", label: "إظهار النقاط للزوار", desc: "الزوار يرون الأرقام الفعلية" },
    { key: "show_ranking", label: "إظهار الترتيب", desc: "أرقام الترتيب تظهر للجميع" },
    { key: "show_medals", label: "إظهار الميداليات 🥇🥈🥉", desc: "ميداليات المراكز الثلاثة" },
    { key: "show_hall_of_fame", label: "إظهار قاعة الشرف", desc: "قسم متميزو اليوم" },
    { key: "show_progress_bar", label: "إظهار شريط التقدم", desc: "شريط النجمة للأدمن" },
    { key: "allow_add_points", label: "السماح بإضافة نقاط", desc: "تفعيل زر (+)" },
    { key: "allow_subtract_points", label: "السماح بإنقاص نقاط", desc: "تفعيل زر (-)" },
  ];

  return (
    <div className="space-y-5">
      {/* مفاتيح التشغيل */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-verse text-base font-bold text-emerald-800">
          إعدادات الظهور والتحكم
        </h2>
        <div className="space-y-3">
          {toggles.map(({ key, label, desc }) => {
            const value = settings[key] as boolean;
            return (
              <div key={key} className="flex items-center justify-between gap-4 rounded-xl border border-emerald-50 px-4 py-3">
                <div>
                  <p className="text-sm font-bold text-night/80">{label}</p>
                  <p className="text-[11px] text-night/50">{desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggle(key, value)}
                  disabled={saving === key}
                  aria-pressed={value}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 ${
                    value ? "bg-emerald-500" : "bg-slate-200"
                  }`}
                >
                  <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${
                    value ? "right-0.5" : "left-0.5"
                  }`} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* رسالة الصيانة */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-verse text-base font-bold text-emerald-800">
          رسالة وضع الصيانة
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={maintenanceMsg}
            onChange={(e) => setMaintenanceMsg(e.target.value)}
            className="flex-1 rounded-xl border border-emerald-100 bg-sand-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={saveMsg}
            disabled={saving === "maintenance_message"}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            حفظ
          </button>
        </div>
      </div>
    </div>
  );
}
