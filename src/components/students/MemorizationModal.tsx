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
  "ممتاز":        "bg-emerald-100 text-emerald-800",
  "جيد جدًا":     "bg-blue-100 text-blue-800",
  "جيد":          "bg-gold-light/40 text-gold-deep",
  "يحتاج إعادة":  "bg-red-100 text-red-700",
};

const emptyTracking: Omit<MemorizationTracking, "id" | "student_id" | "updated_at"> = {
  memorization_start_page: null,
  memorization_end_page: null,
  last_memorized_page: null,
  review_start_page: null,
  review_end_page: null,
  last_reviewed_page: null,
};

const emptyLog = {
  log_date: new Date().toISOString().split("T")[0],
  type: "حفظ" as LogType,
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
  const [logForm, setLogForm] = useState(emptyLog);
  const [savingTracking, setSavingTracking] = useState(false);
  const [savingLog, setSavingLog] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "tracking" | "logs">("summary");

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const [{ data: t }, { data: l }] = await Promise.all([
      supabase
        .from("memorization_tracking")
        .select("*")
        .eq("student_id", student.id)
        .single(),
      supabase
        .from("memorization_logs")
        .select("*")
        .eq("student_id", student.id)
        .order("log_date", { ascending: false })
        .order("created_at", { ascending: false }),
    ]);

    if (t) {
      setTracking(t as MemorizationTracking);
      setTrackingForm({
        memorization_start_page: t.memorization_start_page,
        memorization_end_page: t.memorization_end_page,
        last_memorized_page: t.last_memorized_page,
        review_start_page: t.review_start_page,
        review_end_page: t.review_end_page,
        last_reviewed_page: t.last_reviewed_page,
      });
    }
    setLogs((l as MemorizationLog[]) ?? []);
    setLoading(false);
  }

  async function saveTracking() {
    setSavingTracking(true);
    if (tracking) {
      await supabase
        .from("memorization_tracking")
        .update({ ...trackingForm, updated_at: new Date().toISOString() })
        .eq("id", tracking.id);
    } else {
      await supabase
        .from("memorization_tracking")
        .insert({ student_id: student.id, ...trackingForm });
    }
    await fetchData();
    setSavingTracking(false);
  }

  async function saveLog() {
    if (!logForm.from_page || !logForm.to_page) return;
    setSavingLog(true);
    await supabase.from("memorization_logs").insert({
      student_id: student.id,
      ...logForm,
    });
    setLogForm(emptyLog);
    await fetchData();
    setSavingLog(false);
  }

  async function deleteLog(id: string) {
    await supabase.from("memorization_logs").delete().eq("id", id);
    setLogs((prev) => prev.filter((l) => l.id !== id));
  }

  const nextMemorizationPage =
    tracking?.last_memorized_page
      ? tracking.last_memorized_page + 1
      : tracking?.memorization_start_page ?? null;

  const nextReviewPage =
    tracking?.last_reviewed_page
      ? tracking.last_reviewed_page + 1
      : tracking?.review_start_page ?? null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-night/60 px-4 py-8 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-emerald-100 bg-white shadow-ornate">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-emerald-50 px-6 py-4">
          <div>
            <h2 className="font-verse text-lg font-bold text-emerald-800">
              متابعة الحفظ
            </h2>
            <p className="text-sm text-night/60">{student.full_name}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-100 text-night/40 transition hover:text-night/70"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-emerald-50">
          {(["summary", "tracking", "logs"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-bold transition ${
                activeTab === tab
                  ? "border-b-2 border-emerald-600 text-emerald-700"
                  : "text-night/50 hover:text-night/70"
              }`}
            >
              {tab === "summary" ? "📊 ملخص" : tab === "tracking" ? "📖 الحفظ والمراجعة" : "📋 السجل"}
            </button>
          ))}
        </div>

        <div className="p-6">
          {loading ? (
            <p className="text-center text-sm text-night/50">جارٍ التحميل...</p>
          ) : (
            <>
              {/* Summary Tab */}
              {activeTab === "summary" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <SummaryCard
                      icon="📖"
                      label="الحفظ الحالي"
                      value={
                        tracking?.memorization_start_page && tracking?.memorization_end_page
                          ? `${tracking.memorization_start_page} ← ${tracking.memorization_end_page}`
                          : "—"
                      }
                    />
                    <SummaryCard
                      icon="🔄"
                      label="المراجعة الحالية"
                      value={
                        tracking?.review_start_page && tracking?.review_end_page
                          ? `${tracking.review_start_page} ← ${tracking.review_end_page}`
                          : "—"
                      }
                    />
                    <SummaryCard
                      icon="✅"
                      label="آخر تسميع"
                      value={
                        tracking?.last_memorized_page
                          ? `صفحة ${tracking.last_memorized_page}`
                          : "—"
                      }
                    />
                    <SummaryCard
                      icon="🔁"
                      label="آخر مراجعة"
                      value={
                        tracking?.last_reviewed_page
                          ? `صفحة ${tracking.last_reviewed_page}`
                          : "—"
                      }
                    />
                    <SummaryCard
                      icon="➡️"
                      label="الصفحة التالية للحفظ"
                      value={nextMemorizationPage ? `صفحة ${nextMemorizationPage}` : "—"}
                    />
                    <SummaryCard
                      icon="↩️"
                      label="الصفحة التالية للمراجعة"
                      value={nextReviewPage ? `صفحة ${nextReviewPage}` : "—"}
                    />
                  </div>

                  {/* آخر 3 سجلات */}
                  {logs.length > 0 && (
                    <div className="mt-4">
                      <h3 className="mb-2 text-sm font-bold text-night/70">آخر السجلات</h3>
                      <div className="space-y-2">
                        {logs.slice(0, 3).map((log) => (
                          <LogRow key={log.id} log={log} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tracking Tab */}
              {activeTab === "tracking" && (
                <div className="space-y-5">
                  {/* الحفظ */}
                  <div>
                    <h3 className="mb-3 font-verse text-base font-bold text-emerald-800">
                      📖 الحفظ الحالي
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="بداية الحفظ (صفحة)"
                        value={trackingForm.memorization_start_page ?? ""}
                        disabled={!isAdmin}
                        onChange={(v) =>
                          setTrackingForm((p) => ({ ...p, memorization_start_page: +v || null }))
                        }
                      />
                      <Field
                        label="نهاية الحفظ (صفحة)"
                        value={trackingForm.memorization_end_page ?? ""}
                        disabled={!isAdmin}
                        onChange={(v) =>
                          setTrackingForm((p) => ({ ...p, memorization_end_page: +v || null }))
                        }
                      />
                      <Field
                        label="آخر صفحة سُمِّعت"
                        value={trackingForm.last_memorized_page ?? ""}
                        disabled={!isAdmin}
                        onChange={(v) =>
                          setTrackingForm((p) => ({ ...p, last_memorized_page: +v || null }))
                        }
                      />
                      <div className="flex flex-col justify-end rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                        <p className="text-[11px] text-night/50">الصفحة التالية</p>
                        <p className="text-sm font-bold text-emerald-700">
                          {nextMemorizationPage ? `صفحة ${nextMemorizationPage}` : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* المراجعة */}
                  <div>
                    <h3 className="mb-3 font-verse text-base font-bold text-emerald-800">
                      🔄 المراجعة
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <Field
                        label="بداية المراجعة (صفحة)"
                        value={trackingForm.review_start_page ?? ""}
                        disabled={!isAdmin}
                        onChange={(v) =>
                          setTrackingForm((p) => ({ ...p, review_start_page: +v || null }))
                        }
                      />
                      <Field
                        label="نهاية المراجعة (صفحة)"
                        value={trackingForm.review_end_page ?? ""}
                        disabled={!isAdmin}
                        onChange={(v) =>
                          setTrackingForm((p) => ({ ...p, review_end_page: +v || null }))
                        }
                      />
                      <Field
                        label="آخر صفحة راجعها"
                        value={trackingForm.last_reviewed_page ?? ""}
                        disabled={!isAdmin}
                        onChange={(v) =>
                          setTrackingForm((p) => ({ ...p, last_reviewed_page: +v || null }))
                        }
                      />
                      <div className="flex flex-col justify-end rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3">
                        <p className="text-[11px] text-night/50">الصفحة التالية</p>
                        <p className="text-sm font-bold text-emerald-700">
                          {nextReviewPage ? `صفحة ${nextReviewPage}` : "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={saveTracking}
                      disabled={savingTracking}
                      className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                      {savingTracking ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                    </button>
                  )}
                </div>
              )}

              {/* Logs Tab */}
              {activeTab === "logs" && (
                <div className="space-y-5">
                  {/* إضافة سجل جديد — للأدمن فقط */}
                  {isAdmin && (
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-4">
                      <h3 className="mb-3 text-sm font-bold text-emerald-800">
                        ➕ إضافة سجل جديد
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-1 block text-[11px] text-night/60">التاريخ</label>
                          <input
                            type="date"
                            value={logForm.log_date}
                            onChange={(e) => setLogForm((p) => ({ ...p, log_date: e.target.value }))}
                            className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] text-night/60">النوع</label>
                          <select
                            value={logForm.type}
                            onChange={(e) => setLogForm((p) => ({ ...p, type: e.target.value as LogType }))}
                            className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                          >
                            <option value="حفظ">حفظ</option>
                            <option value="مراجعة">مراجعة</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] text-night/60">من صفحة</label>
                          <input
                            type="number"
                            value={logForm.from_page || ""}
                            onChange={(e) => setLogForm((p) => ({ ...p, from_page: +e.target.value }))}
                            className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] text-night/60">إلى صفحة</label>
                          <input
                            type="number"
                            value={logForm.to_page || ""}
                            onChange={(e) => setLogForm((p) => ({ ...p, to_page: +e.target.value }))}
                            className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="5"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] text-night/60">التقدير</label>
                          <select
                            value={logForm.grade}
                            onChange={(e) => setLogForm((p) => ({ ...p, grade: e.target.value as LogGrade }))}
                            className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                          >
                            {GRADES.map((g) => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] text-night/60">ملاحظات</label>
                          <input
                            type="text"
                            value={logForm.notes}
                            onChange={(e) => setLogForm((p) => ({ ...p, notes: e.target.value }))}
                            className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
                            placeholder="اختياري"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={saveLog}
                        disabled={savingLog || !logForm.from_page || !logForm.to_page}
                        className="mt-3 w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {savingLog ? "جارٍ الحفظ..." : "إضافة السجل"}
                      </button>
                    </div>
                  )}

                  {/* قائمة السجلات */}
                  {logs.length === 0 ? (
                    <p className="text-center text-sm text-night/50">لا توجد سجلات بعد.</p>
                  ) : (
                    <div className="space-y-2">
                      {logs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start justify-between gap-3 rounded-xl border border-emerald-50 bg-white px-4 py-3 shadow-sm"
                        >
                          <div className="flex-1">
                            <LogRow log={log} />
                          </div>
                          {isAdmin && (
                            <button
                              type="button"
                              onClick={() => deleteLog(log.id)}
                              className="shrink-0 text-red-400 transition hover:text-red-600"
                              aria-label="حذف السجل"
                            >
                              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                                <path
                                  d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.6"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3">
      <p className="text-[11px] text-night/50">{icon} {label}</p>
      <p className="mt-1 text-sm font-bold text-emerald-800">{value}</p>
    </div>
  );
}

function Field({
  label,
  value,
  disabled,
  onChange,
}: {
  label: string;
  value: number | string;
  disabled: boolean;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-[11px] text-night/60">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 disabled:bg-sand-50 disabled:text-night/50"
        placeholder="—"
      />
    </div>
  );
}

function LogRow({ log }: { log: MemorizationLog }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <span className="font-medium text-night/60">{log.log_date}</span>
      <span className={`rounded-full px-2 py-0.5 font-bold ${log.type === "حفظ" ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"}`}>
        {log.type}
      </span>
      <span className="text-night/70">ص {log.from_page} ← {log.to_page}</span>
      <span className={`rounded-full px-2 py-0.5 font-bold ${GRADE_COLORS[log.grade]}`}>
        {log.grade}
      </span>
      {log.notes && <span className="text-night/50">{log.notes}</span>}
    </div>
  );
}
