"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { AppSettings } from "@/lib/settings";
import { updateSetting, logAdminAction } from "@/lib/supabase/settings";

export default function SessionManager({
  settings,
  studentsCount,
}: {
  settings: AppSettings;
  studentsCount: number;
}) {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [showNewConfirm, setShowNewConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sessionName, setSessionName] = useState(settings.session_name);
  const [error, setError] = useState<string | null>(null);

  async function handleEndSession() {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await updateSetting(supabase, "session_ended", true);
      await logAdminAction(supabase, "إنهاء الدورة", {
        session_name: settings.session_name,
      }, user?.email);
      setShowEndConfirm(false);
      router.refresh();
    } catch {
      setError("تعذّر إنهاء الدورة.");
    } finally {
      setLoading(false);
    }
  }

  async function handleNewSession() {
    setLoading(true);
    setError(null);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      // تصفير النقاط
      await supabase.from("students").update({
        points: 0,
        daily_points: 0,
        daily_points_date: null,
      }).neq("id", "00000000-0000-0000-0000-000000000000");

      const today = new Date().toISOString().split("T")[0];
      await updateSetting(supabase, "session_ended", false);
      await updateSetting(supabase, "session_name", sessionName || "الدورة الجديدة");
      await updateSetting(supabase, "session_start_date", today);

      await logAdminAction(supabase, "بدء دورة جديدة", {
        session_name: sessionName,
        start_date: today,
      }, user?.email);

      setShowNewConfirm(false);
      router.refresh();
    } catch {
      setError("تعذّر بدء دورة جديدة.");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateName() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    await updateSetting(supabase, "session_name", sessionName);
    await logAdminAction(supabase, "تغيير اسم الدورة", { name: sessionName }, user?.email);
    setLoading(false);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {/* حالة الدورة */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-verse text-base font-bold text-emerald-800">
          حالة الدورة الحالية
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <InfoCard label="الاسم" value={settings.session_name} />
          <InfoCard
            label="الحالة"
            value={settings.session_ended ? "🏁 منتهية" : "✅ نشطة"}
          />
          <InfoCard
            label="تاريخ البداية"
            value={settings.session_start_date ?? "—"}
          />
          <InfoCard label="عدد الطلاب" value={studentsCount.toString()} />
        </div>
      </div>

      {/* تعديل اسم الدورة */}
      <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-verse text-base font-bold text-emerald-800">
          اسم الدورة
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            className="flex-1 rounded-xl border border-emerald-100 bg-sand-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
            placeholder="اسم الدورة"
          />
          <button
            type="button"
            onClick={handleUpdateName}
            disabled={loading}
            className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
          >
            حفظ
          </button>
        </div>
      </div>

      {/* الأزرار الرئيسية */}
      <div className="grid gap-4 sm:grid-cols-2">
        {!settings.session_ended ? (
          <DangerCard
            title="🏁 إنهاء الدورة"
            description="تأكيد النتائج الحالية كنهاية للدورة. النقاط لن تُحذف."
            buttonLabel="إنهاء الدورة"
            onClick={() => setShowEndConfirm(true)}
          />
        ) : (
          <SafeCard
            title="🚀 بدء دورة جديدة"
            description="تصفير النقاط وبدء دورة جديدة. الطلاب لن يُحذفوا."
            buttonLabel="بدء دورة جديدة"
            onClick={() => setShowNewConfirm(true)}
          />
        )}
      </div>

      {/* نافذة تأكيد إنهاء الدورة */}
      {showEndConfirm && (
        <ConfirmModal
          title="🏁 إنهاء الدورة"
          message="هل أنت متأكد من إنهاء الدورة؟ سيتم اعتماد النتائج الحالية. لن يتم حذف الطلاب أو النقاط."
          confirmLabel="تأكيد إنهاء الدورة"
          confirmClass="bg-red-600 hover:bg-red-700"
          loading={loading}
          onConfirm={handleEndSession}
          onCancel={() => setShowEndConfirm(false)}
        />
      )}

      {/* نافذة تأكيد بدء دورة جديدة */}
      {showNewConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-ornate">
            <h2 className="mb-2 font-verse text-lg font-bold text-emerald-800">
              🚀 بدء دورة جديدة
            </h2>
            <p className="mb-4 text-sm text-night/60">
              سيتم تصفير جميع النقاط وبدء دورة جديدة. الطلاب وصورهم لن يُحذفوا.
            </p>
            <div className="mb-4">
              <label className="mb-1.5 block text-sm font-medium text-night/70">
                اسم الدورة الجديدة
              </label>
              <input
                type="text"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                className="w-full rounded-xl border border-emerald-100 bg-sand-50 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
                placeholder="مثال: دورة الصيف 2026"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowNewConfirm(false)}
                disabled={loading}
                className="flex-1 rounded-xl border border-emerald-100 py-2.5 text-sm font-semibold text-night/70 transition hover:bg-sand-100 disabled:opacity-50"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleNewSession}
                disabled={loading || !sessionName.trim()}
                className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                {loading ? "جارٍ التنفيذ..." : "بدء الدورة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
      <p className="text-[11px] text-night/50">{label}</p>
      <p className="mt-1 text-sm font-bold text-emerald-800">{value}</p>
    </div>
  );
}

function DangerCard({ title, description, buttonLabel, onClick }: {
  title: string; description: string; buttonLabel: string; onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/40 p-5">
      <h3 className="mb-2 font-bold text-red-800">{title}</h3>
      <p className="mb-4 text-sm text-red-700/70">{description}</p>
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function SafeCard({ title, description, buttonLabel, onClick }: {
  title: string; description: string; buttonLabel: string; onClick: () => void;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-5">
      <h3 className="mb-2 font-bold text-emerald-800">{title}</h3>
      <p className="mb-4 text-sm text-emerald-700/70">{description}</p>
      <button
        type="button"
        onClick={onClick}
        className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
      >
        {buttonLabel}
      </button>
    </div>
  );
}

function ConfirmModal({ title, message, confirmLabel, confirmClass, loading, onConfirm, onCancel }: {
  title: string; message: string; confirmLabel: string;
  confirmClass: string; loading: boolean;
  onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-emerald-100 bg-white p-6 shadow-ornate">
        <h2 className="mb-2 font-verse text-lg font-bold text-emerald-800">{title}</h2>
        <p className="mb-6 text-sm text-night/60">{message}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} disabled={loading}
            className="flex-1 rounded-xl border border-emerald-100 py-2.5 text-sm font-semibold text-night/70 transition hover:bg-sand-100 disabled:opacity-50">
            إلغاء
          </button>
          <button type="button" onClick={onConfirm} disabled={loading}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold text-white transition disabled:opacity-60 ${confirmClass}`}>
            {loading ? "جارٍ التنفيذ..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
  }
