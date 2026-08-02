"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type {
  Student,
  MemorizationTracking,
  MemorizationLog,
  LogType,
  LogGrade,
} from "@/types/database.types";

const GRADES: LogGrade[] = ["ممتاز", "جيد جدًا", "جيد", "يحتاج إعادة"];
const GRADE_COLORS: Record<LogGrade, string> = {
  "ممتاز":       "bg-emerald-100 text-emerald-800",
  "جيد جدًا":    "bg-blue-100 text-blue-800",
  "جيد":         "bg-gold-light/40 text-gold-deep",
  "يحتاج إعادة": "bg-red-100 text-red-700",
};

const emptyTracking: Omit<MemorizationTracking, "id" | "student_id" | "updated_at"> = {
  memorization_start_page: null,
  memorization_end_page: null,
  last_memorized_page: null,
  memorization_start_page_2: null,
  memorization_end_page_2: null,
  last_memorized_page_2: null,
  review_start_page: null,
  review_end_page: null,
  last_reviewed_page: null,
  review_start_page_2: null,
  review_end_page_2: null,
  last_reviewed_page_2: null,
};

const emptyMemLog = {
  log_date: new Date().toISOString().split("T")[0],
  type: "حفظ" as LogType,
  from_page: "" as unknown as number,
  to_page: "" as unknown as number,
  grade: "ممتاز" as LogGrade,
  notes: "",
};

const emptyRevLog = {
  log_date: new Date().toISOString().split("T")[0],
  type: "مراجعة" as LogType,
  from_page: "" as unknown as number,
  to_page: "" as unknown as number,
  grade: "ممتاز" as LogGrade,
  notes: "",
};

export default function MemorizationModal({
  student,
  isAdmin,
  onClose,
}: {
  student: Student;
  isAdmin: boolean;
  onClose: () => void;
}) {
  const [supabase] = useState(() => createClient());
  const [tracking, setTracking] = useState<MemorizationTracking | null>(null);
  const [logs, setLogs] = useState<MemorizationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackingForm, setTrackingForm] = useState(emptyTracking);
  const [memLogForm, setMemLogForm] = useState(emptyMemLog);
  const [revLogForm, setRevLogForm] = useState(emptyRevLog);
  const [savingTracking, setSavingTracking] = useState(false);
  const [savingMemLog, setSavingMemLog] = useState(false);
  const [savingRevLog, setSavingRevLog] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "memorization" | "review">("summary");
  const [showRange2Mem, setShowRange2Mem] = useState(false);
  const [showRange2Rev, setShowRange2Rev] = useState(false);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    const [{ data: t }, { data: l }] = await Promise.all([
      supabase.from("memorization_tracking").select("*").eq("student_id", student.id).single(),
      supabase.from("memorization_logs").select("*").eq("student_id", student.id)
        .order("log_date", { ascending: false }).order("created_at", { ascending: false }),
    ]);

    if (t) {
      setTracking(t as MemorizationTracking);
      setTrackingForm({
        memorization_start_page: t.memorization_start_page,
        memorization_end_page: t.memorization_end_page,
        last_memorized_page: t.last_memorized_page,
        memorization_start_page_2: t.memorization_start_page_2,
        memorization_end_page_2: t.memorization_end_page_2,
        last_memorized_page_2: t.last_memorized_page_2,
        review_start_page: t.review_start_page,
        review_end_page: t.review_end_page,
        last_reviewed_page: t.last_reviewed_page,
        review_start_page_2: t.review_start_page_2,
        review_end_page_2: t.review_end_page_2,
        last_reviewed_page_2: t.last_reviewed_page_2,
      });
      if (t.memorization_start_page_2) setShowRange2Mem(true);
      if (t.review_start_page_2) setShowRange2Rev(true);
    }
    setLogs((l as MemorizationLog[]) ?? []);
    setLoading(false);
  }

  async function saveTracking() {
    setSavingTracking(true);
    if (tracking) {
      await supabase.from("memorization_tracking")
        .update({ ...trackingForm, updated_at: new Date().toISOString() })
        .eq("id", tracking.id);
    } else {
      await supabase.from("memorization_tracking")
        .insert({ student_id: student.id, ...trackingForm });
    }
    await fetchData();
    setSavingTracking(false);
  }

  async function saveLog(form: typeof memLogForm, setSaving: (v: boolean) => void, resetForm: () => void) {
    if (!form.from_page || !form.to_page) return;
    setSaving(true);
    await supabase.from("memorization_logs").insert({ student_id: student.id, ...form });
    resetForm();
    await fetchData();
    setSaving(false);
  }

  async function deleteLog(id: string) {
    await supabase.from("memorization_logs").delete().eq("id", id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  const memLogs = logs.filter((l) => l.type === "حفظ");
  const revLogs = logs.filter((l) => l.type === "مراجعة");

  const nextMemPage = tracking?.last_memorized_page
    ? tracking.last_memorized_page + 1
    : tracking?.memorization_start_page ?? null;

  const nextMemPage2 = tracking?.last_memorized_page_2
    ? tracking.last_memorized_page_2 + 1
    : tracking?.memorization_start_page_2 ?? null;

  const nextRevPage = tracking?.last_reviewed_page
    ? tracking.last_reviewed_page + 1
    : tracking?.review_start_page ?? null;

  const nextRevPage2 = tracking?.last_reviewed_page_2
    ? tracking.last_reviewed_page_2 + 1
    : tracking?.review_start_page_2 ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-night/60 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-emerald-100 bg-white shadow-ornate">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-50 px-6 py-4">
          <div>
            <h2 className="font-verse text-lg font-bold text-emerald-800">متابعة الحفظ</h2>
            <p className="text-sm text-night/60">{student.full_name}</p>
          </div>
          <button type="button" onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100 text-night/40 transition hover:text-night/70">
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-emerald-50">
          {([
            { key: "summary", label: "📊 ملخص" },
            { key: "memorization", label: "📖 الحفظ" },
            { key: "review", label: "🔄 المراجعة" },
          ] as const).map(({ key, label }) => (
            <button key={key} type="button" onClick={() => setActiveTab(key)}
              className={`flex-1 py-3 text-sm font-bold transition ${
                activeTab === key
                  ? "border-b-2 border-emerald-600 text-emerald-700"
                  : "text-night/50 hover:text-night/70"
              }`}>
              {label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-sm text-night/50">جارٍ التحميل...</p>
          ) : (
            <>
              {/* ===== ملخص ===== */}
              {activeTab === "summary" && (
                <div className="space-y-4">
                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-night/40">الحفظ</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <SummaryCard icon="📖" label="النطاق الأول"
                        value={tracking?.memorization_start_page && tracking?.memorization_end_page
                          ? `${tracking.memorization_start_page} ← ${tracking.memorization_end_page}` : "—"} />
                      {tracking?.memorization_start_page_2 && (
                        <SummaryCard icon="📖" label="النطاق الثاني"
                          value={tracking?.memorization_start_page_2 && tracking?.memorization_end_page_2
                            ? `${tracking.memorization_start_page_2} ← ${tracking.memorization_end_page_2}` : "—"} />
                      )}
                      <SummaryCard icon="✅" label="آخر تسميع"
                        value={tracking?.last_memorized_page ? `صفحة ${tracking.last_memorized_page}` : "—"} />
                      <SummaryCard icon="➡️" label="الصفحة التالية"
                        value={nextMemPage ? `صفحة ${nextMemPage}` : "—"} />
                      {memLogs.length > 0 && (
                        <div className="col-span-2">
                          <p className="mb-1 text-[11px] text-night/40">آخر جلسات الحفظ</p>
                          <div className="space-y-1.5">
                            {memLogs.slice(0, 2).map((log) => <LogRow key={log.id} log={log} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-night/40">المراجعة</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <SummaryCard icon="🔄" label="النطاق الأول"
                        value={tracking?.review_start_page && tracking?.review_end_page
                          ? `${tracking.review_start_page} ← ${tracking.review_end_page}` : "—"} />
                      {tracking?.review_start_page_2 && (
                        <SummaryCard icon="🔄" label="النطاق الثاني"
                          value={tracking?.review_start_page_2 && tracking?.review_end_page_2
                            ? `${tracking.review_start_page_2} ← ${tracking.review_end_page_2}` : "—"} />
                      )}
                      <SummaryCard icon="🔁" label="آخر مراجعة"
                        value={tracking?.last_reviewed_page ? `صفحة ${tracking.last_reviewed_page}` : "—"} />
                      <SummaryCard icon="↩️" label="الصفحة التالية"
                        value={nextRevPage ? `صفحة ${nextRevPage}` : "—"} />
                      {revLogs.length > 0 && (
                        <div className="col-span-2">
                          <p className="mb-1 text-[11px] text-night/40">آخر جلسات المراجعة</p>
                          <div className="space-y-1.5">
                            {revLogs.slice(0, 2).map((log) => <LogRow key={log.id} log={log} />)}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* ===== تبويب الحفظ ===== */}
              {activeTab === "memorization" && (
                <div className="space-y-6">

                  {/* إعدادات الحفظ */}
                  <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-4">
                    <h3 className="mb-3 font-verse text-sm font-bold text-emerald-800">
                      📖 النطاق الأول
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="بداية الحفظ" value={trackingForm.memorization_start_page ?? ""} disabled={!isAdmin}
                        onChange={(v) => setTrackingForm((p) => ({ ...p, memorization_start_page: +v || null }))} />
                      <Field label="نهاية الحفظ" value={trackingForm.memorization_end_page ?? ""} disabled={!isAdmin}
                        onChange={(v) => setTrackingForm((p) => ({ ...p, memorization_end_page: +v || null }))} />
                      <Field label="آخر صفحة سُمِّعت" value={trackingForm.last_memorized_page ?? ""} disabled={!isAdmin}
                        onChange={(v) => setTrackingForm((p) => ({ ...p, last_memorized_page: +v || null }))} />
                      <div className="flex flex-col justify-end rounded-xl border border-emerald-100 bg-white px-4 py-3">
                        <p className="text-[11px] text-night/50">الصفحة التالية</p>
                        <p className="text-sm font-bold text-emerald-700">
                          {nextMemPage ? `صفحة ${nextMemPage}` : "—"}
                        </p>
                      </div>
                    </div>

                    {/* النطاق الثاني */}
                    {showRange2Mem ? (
                      <div className="mt-4">
                        <h3 className="mb-3 font-verse text-sm font-bold text-emerald-800">📖 النطاق الثاني</h3>
                        <div className="grid grid-cols-2 gap-3">
                          <Field label="بداية الحفظ" value={trackingForm.memorization_start_page_2 ?? ""} disabled={!isAdmin}
                            onChange={(v) => setTrackingForm((p) => ({ ...p, memorization_start_page_2: +v || null }))} />
                          <Field label="نهاية الحفظ" value={trackingForm.memorization_end_page_2 ?? ""} disabled={!isAdmin}
                            onChange={(v) => setTrackingForm((p) => ({ ...p, memorization_end_page_2: +v || null }))} />
                          <Field label="آخر صفحة سُمِّعت" value={trackingForm.last_memorized_page_2 ?? ""} disabled={!isAdmin}
                            onChange={(v) => setTrackingForm((p) => ({ ...p, last_memorized_page_2: +v || null }))} />
                          <div className="flex flex-col justify-end rounded-xl border border-emerald-100 bg-white px-4 py-3">
                            <p className="text-[11px] text-night/50">الصفحة التالية</p>
                            <p className="text-sm font-bold text-emerald-700">
                              {nextMemPage2 ? `صفحة ${nextMemPage2}` : "—"}
                            </p>
                          </div>
                        </div>
                        {isAdmin && (
                          <button type="button" onClick={() => { setShowRange2Mem(false); setTrackingForm((p) => ({ ...p, memorization_start_page_2: null, memorization_end_page_2: null, last_memorized_page_2: null })); }}
                            className="mt-2 text-xs text-red-400 transition hover:text-red-600">
                            ✕ إزالة النطاق الثاني
                          </button>
                        )}
                      </div>
                    ) : isAdmin && (
                      <button type="button" onClick={() => setShowRange2Mem(true)}
                        className="mt-3 flex items-center gap-1 text-xs font-medium text-emerald-600 transition hover:text-emerald-800">
                        <span>+</span> إضافة نطاق ثانٍ
                      </button>
                    )}

                    {isAdmin && (
                      <button type="button" onClick={saveTracking} disabled={savingTracking}
                        className="mt-4 w-full rounded-xl bg-emerald-600 py-2 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60">
                        {savingTracking ? "جارٍ الحفظ..." : "حفظ الإعدادات"}
                      </button>
                    )}
                  </div>

                  {/* إضافة جلسة حفظ */}
                  {isAdmin && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                      <h3 className="mb-3 text-sm font-bold text-emerald-800">➕ تسجيل جلسة حفظ</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[11px] text-night/60">التاريخ</label>
                          <input type="date" value={memLogForm.log_date}
                            onChange={(e) => setMemLogForm((p) => ({ ...p, log_date: e.target.value }))}
                            className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] text-night/60">التقدير</label>
                          <select value={memLogForm.grade}
                            onChange={(e) => setMemLogForm((p) => ({ ...p, grade: e.target.value as LogGrade }))}
                            className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500">
                            {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] text-night/60">من صفحة</label>
                          <input type="number" value={memLogForm.from_page || ""}
                            onChange={(e) => setMemLogForm((p) => ({ ...p, from_page: +e.target.value }))}
                            className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" placeholder="1" />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] text-night/60">إلى صفحة</label>
                          <input type="number" value={memLogForm.to_page || ""}
                            onChange={(e) => setMemLogForm((p) => ({ ...p, to_page: +e.target.value }))}
                            className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" placeholder="5" />
                        </div>
                        <div className="col-span-2">
                          <label className="mb-1 block text-[11px] text-night/60">ملاحظات</label>
                          <input type="text" value={memLogForm.notes}
                            onChange={(e) => setMemLogForm((p) => ({ ...p, notes: e.target.value }))}
                            className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500" placeholder="اختياري" />
                        </div>
                      </div>
                      <button type="button"
                        onClick={() => saveLog(memLogForm, setSavingMemLog, () => setMemLogForm(emptyMemLog))}
                        disabled={savingMemLog || !memLogForm.from_page || !memLogForm.to_page}
                        className="mt-3 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60">
                        {savingMemLog ? "جارٍ الحفظ..." : "تسجيل الجلسة"}
                      </button>
                    </div>
                  )}

                  {/* سجل الحفظ */}
                  <div>
                    <h3 className="mb-3 text-sm font-bold text-night/60">
                      سجل جلسات الحفظ ({memLogs.length})
                    </h3>
                    {memLogs.length === 0 ? (
                      <p className="text-center text-sm text-night/40">لا توجد جلسات مسجّلة بعد.</p>
                    ) : (
                      <div className="space-y-2">
                        {memLogs.map((log) => (
                          <div key={log.id} className="flex items-center justify-between gap-3 rounded-xl border border-emerald-50 bg-white px-4 py-3 shadow-sm">
                            <LogRow log={log} />
                            {isAdmin && (
                              <button type="button" onClick={() => deleteLog(log.id)}
                                className="shrink-0 text-red-400 transition hover:text-red-600">
                                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                                  <path d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
     
