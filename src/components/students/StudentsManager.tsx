"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Student } from "@/types/database.types";
import {
  deleteStudentPhoto,
  uploadStudentPhoto,
} from "@/lib/students/storage";
import { getSavedLocale, getTranslations } from "@/lib/i18n";
import StudentCard from "./StudentCard";
import StudentFormModal, {
  type StudentFormSubmitData,
} from "./StudentFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import StatsBar from "./StatsBar";
import HallOfFame from "./HallOfFame";
import MemorizationModal from "./MemorizationModal";
import type { AppSettings } from "@/lib/settings";

type FormModalState =
  | { mode: "add" }
  | { mode: "edit"; student: Student }
  | null;

/**
 * الحصول على التاريخ الحالي بتوقيت تركيا.
 */
function getTurkeyDate(): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "0";

  return `${get("year")}-${get("month")}-${get("day")}`;
}

/**
 * الحصول على الوقت الحالي بتوقيت تركيا.
 */
function getTurkeyNow(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "0";

  return new Date(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")),
    Number(get("minute")),
    Number(get("second"))
  );
}

/**
 * الجمعة = عطلة.
 */
function isFridayInTurkey(): boolean {
  return getTurkeyNow().getDay() === 5;
}

export default function StudentsManager({
  initialStudents,
  role,
  settings,
}: {
  initialStudents: Student[];
  role: "admin" | "viewer";
  settings: AppSettings;
}) {
  const isAdmin = role === "admin";
  const [supabase] = useState(() => createClient());
  const t = getTranslations(getSavedLocale());

  const [students, setStudents] =
    useState<Student[]>(initialStudents);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [formModal, setFormModal] =
    useState<FormModalState>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  const [formSubmitting, setFormSubmitting] =
    useState(false);

  const [deleteTarget, setDeleteTarget] =
    useState<Student | null>(null);

  const [deleteSubmitting, setDeleteSubmitting] =
    useState(false);

  const [deleteError, setDeleteError] =
    useState<string | null>(null);

  const [trackingStudent, setTrackingStudent] =
    useState<Student | null>(null);

  const [pendingPointsId, setPendingPointsId] =
    useState<string | null>(null);

  // النقاط والشريط مخفيان افتراضيًا.
  const [showPoints, setShowPoints] =
    useState(false);

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * تحديث التقييم تلقائيًا كل ساعة
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *
   * StudentCard يعتمد على getStudentStatus().
   *
   * لذلك لا نحتاج تغيير StudentCard.
   * مجرد إعادة render تكفي لإعادة حساب الحالة.
   *
   * نستخدم timeout إلى بداية الساعة التالية
   * ثم نبدأ interval كل ساعة.
   */
  const [, setStatusRefresh] =
    useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null =
      null;

    const refresh = () => {
      setStatusRefresh((value) => value + 1);
    };

    const now = new Date();

    // الوقت المتبقي حتى بداية الساعة القادمة.
    const millisecondsUntilNextHour =
      (60 - now.getMinutes()) * 60 * 1000 -
      now.getSeconds() * 1000 -
      now.getMilliseconds();

    const timeout = setTimeout(() => {
      refresh();

      interval = setInterval(
        refresh,
        60 * 60 * 1000
      );
    }, millisecondsUntilNextHour);

    return () => {
      clearTimeout(timeout);

      if (interval) {
        clearInterval(interval);
      }
    };
  }, []);

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * Supabase Realtime
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  useEffect(() => {
    const channel = supabase
      .channel("students-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "students",
        },
        (payload) => {
          setStudents((prev) => {
            if (payload.eventType === "INSERT") {
              const incoming =
                payload.new as Student;

              if (
                prev.some(
                  (student) =>
                    student.id === incoming.id
                )
              ) {
                return prev;
              }

              return [
                incoming,
                ...prev,
              ];
            }

            if (payload.eventType === "UPDATE") {
              const updated =
                payload.new as Student;

              return prev.map((student) =>
                student.id === updated.id
                  ? updated
                  : student
              );
            }

            if (payload.eventType === "DELETE") {
              const removedId =
                (payload.old as Partial<Student>).id;

              return prev.filter(
                (student) =>
                  student.id !== removedId
              );
            }

            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * الترتيب
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  const sortedStudents = useMemo(() => {
    if (!isAdmin) {
      return [...students].sort((a, b) =>
        a.full_name.localeCompare(
          b.full_name,
          "ar"
        )
      );
    }

    return [...students].sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      return a.created_at.localeCompare(
        b.created_at
      );
    });
  }, [students, isAdmin]);

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * الترتيب الرقمي
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  const rankMap = useMemo(() => {
    const map =
      new Map<string, number>();

    let currentRank = 0;
    let lastPoints: number | null = null;

    sortedStudents.forEach(
      (student, index) => {
        if (
          lastPoints === null ||
          student.points !== lastPoints
        ) {
          currentRank = index + 1;
          lastPoints = student.points;
        }

        map.set(
          student.id,
          currentRank
        );
      }
    );

    return map;
  }, [sortedStudents]);

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * البحث
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  const filteredStudents = useMemo(() => {
    const term =
      searchTerm
        .trim()
        .toLowerCase();

    if (!term) {
      return sortedStudents;
    }

    return sortedStudents.filter(
      (student) =>
        student.full_name
          .toLowerCase()
          .includes(term)
    );
  }, [
    sortedStudents,
    searchTerm,
  ]);

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * إضافة / تعديل طالب
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  async function handleFormSubmit(
    data: StudentFormSubmitData
  ) {
    setFormSubmitting(true);
    setFormError(null);

    try {
      /**
       * إضافة طالب
       */
      if (
        formModal?.mode === "add"
      ) {
        const id =
          crypto.randomUUID();

        let photoUrl:
          | string
          | null = null;

        if (data.file) {
          photoUrl =
            await uploadStudentPhoto(
              supabase,
              id,
              data.file
            );
        }

        const {
          data: userData,
        } =
          await supabase.auth.getUser();

        const { error } =
          await supabase
            .from("students")
            .insert({
              id,
              full_name:
                data.name,
              photo_url:
                photoUrl,
              created_by:
                userData.user?.id ??
                null,
            });

        if (error) {
          throw new Error(
            `تعذّرت إضافة الطالب: ${error.message}`
          );
        }
      }

      /**
       * تعديل طالب
       */
      if (
        formModal?.mode === "edit"
      ) {
        const studentId =
          formModal.student.id;

        let photoUrl =
          formModal.student
            .photo_url;

        if (data.file) {
          photoUrl =
            await uploadStudentPhoto(
              supabase,
              studentId,
              data.file
            );
        }

        const { error } =
          await supabase
            .from("students")
            .update({
              full_name:
                data.name,
              photo_url:
                photoUrl,
            })
            .eq(
              "id",
              studentId
            );

        if (error) {
          throw new Error(
            `تعذّر حفظ التعديلات: ${error.message}`
          );
        }
      }

      setFormModal(null);
    } catch (err) {
      setFormError(
        err instanceof Error
          ? err.message
          : "حدث خطأ غير متوقع."
      );
    } finally {
      setFormSubmitting(false);
    }
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * تغيير نقاط الطالب
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *
   * مهم:
   *
   * لم نعد ننقل النقاط إلى
   * yesterday_points.
   *
   * التقييم يعتمد على:
   *
   * daily_points
   * +
   * daily_points_date
   *
   * وبالتالي لا يوجد ارتباط مباشر
   * بمفهوم "أمس".
   */
  async function handlePointChange(
      // التحقق من الإعدادات
  if (delta > 0 && !settings.allow_add_points) return;
  if (delta < 0 && !settings.allow_subtract_points) return;
    student: Student,
    delta: number
  ) {
    const newPoints =
      Math.max(
        0,
        student.points + delta
      );

    if (
      newPoints ===
      student.points
    ) {
      return;
    }

    /**
     * الجمعة عطلة.
     */
    if (
      isFridayInTurkey()
    ) {
      return;
    }

    setPendingPointsId(
      student.id
    );

    /**
     * حفظ الحالة السابقة
     * للـ rollback.
     */
    const previousPoints =
      student.points;

    const previousDailyPoints =
      student.daily_points;

    const previousDailyDate =
      student.daily_points_date;

    const previousYesterdayPoints =
      student.yesterday_points;

    /**
     * التاريخ الصحيح بتوقيت تركيا.
     */
    const today =
      getTurkeyDate();

    /**
     * هل النقاط اليومية
     * تخص اليوم الحالي؟
     */
    const isCurrentDay =
      student.daily_points_date ===
      today;

    let newDailyPoints: number;

    if (isCurrentDay) {
      /**
       * ما زلنا في نفس يوم التقييم.
       */
      newDailyPoints =
        Math.max(
          0,
          student.daily_points +
            delta
        );
    } else {
      /**
       * بدأ يوم تقييم جديد.
       *
       * لا ننقل اليوم السابق
       * إلى yesterday_points.
       *
       * يبدأ تقييم اليوم
       * من الصفر ثم يأخذ delta.
       */
      newDailyPoints =
        Math.max(
          0,
          delta
        );
    }

    /**
     * Optimistic UI
     */
    setStudents((prev) =>
      prev.map((s) =>
        s.id === student.id
          ? {
              ...s,

              points:
                newPoints,

              daily_points:
                newDailyPoints,

              daily_points_date:
                today,

              /**
               * نُبقي القيمة القديمة
               * كما هي للتوافق مع
               * قاعدة البيانات الحالية.
               *
               * لكن منطق التقييم الجديد
               * لا يعتمد عليها.
               */
              yesterday_points:
                s.yesterday_points,
            }
          : s
      )
    );

    /**
     * حفظ في Supabase
     */
    const { error } =
      await supabase
        .from("students")
        .update({
          points:
            newPoints,

          daily_points:
            newDailyPoints,

          daily_points_date:
            today,
        })
        .eq(
          "id",
          student.id
        );

    /**
     * Rollback
     */
    if (error) {
      setStudents((prev) =>
        prev.map((s) =>
          s.id === student.id
            ? {
                ...s,

                points:
                  previousPoints,

                daily_points:
                  previousDailyPoints,

                daily_points_date:
                  previousDailyDate,

                yesterday_points:
                  previousYesterdayPoints,
              }
            : s
        )
      );
    }

    setPendingPointsId(null);
  }

  /**
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * حذف الطالب
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  async function handleDeleteConfirm() {
    if (!deleteTarget) {
      return;
    }

    setDeleteSubmitting(true);
    setDeleteError(null);

    try {
      await deleteStudentPhoto(
        supabase,
        deleteTarget.id
      );

      const { error } =
        await supabase
          .from("students")
          .delete()
          .eq(
            "id",
            deleteTarget.id
          );

      if (error) {
        throw error;
      }

      setDeleteTarget(null);
    } catch {
      setDeleteError(
        "تعذّر حذف الطالب. الرجاء المحاولة مرة أخرى."
      );
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <div>
      {/* الإحصائيات */}
      <div className="mb-6">
        <StatsBar
          students={students}
        />
      </div>

      {/* قاعة الشرف */}
      <div className="mb-8">
        <HallOfFame
          students={students}
        />
      </div>

      {/* البحث والأزرار */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-night/40"
            aria-hidden="true"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
            />

            <path
              d="m20 20-3.5-3.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>

          <input
            type="search"
            value={searchTerm}
            onChange={(e) =>
              setSearchTerm(
                e.target.value
              )
            }
            placeholder={
              t.searchPlaceholder
            }
            className="w-full rounded-xl border border-emerald-100 bg-white py-2.5 pr-10 pl-4 text-sm text-night outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

       
          <div className="flex flex-wrap items-center justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                setShowPoints(
                  (prev) => !prev
                )
              }
              className="inline-flex shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gold-light/20 px-4 py-2.5 text-sm font-bold text-gold-deep transition hover:bg-gold-light/40"
              aria-pressed={
                showPoints
              }
            >
              {showPoints
                ? "إخفاء النقاط"
                : "إظهار النقاط"}
            </button>

            <button
              type="button"
              onClick={() => {
                setFormError(null);

                setFormModal({
                  mode: "add",
                });
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  d="M12 5v14M5 12h14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>

              {t.addStudent}
            </button>
          </div>
        
      </div>

      {/* عدد الطلاب */}
      <p className="mb-4 text-sm text-night/50">
        {filteredStudents.length}{" "}
        {filteredStudents.length ===
        1
          ? t.studentCount
          : t.studentCountPlural}

        {searchTerm &&
          ` ${t.outOf} ${students.length}`}
      </p>

      {/* الطلاب */}
      {filteredStudents.length ===
      0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-14 text-center">
          <p className="text-sm text-night/50">
            {students.length ===
            0
              ? isAdmin
                ? t.noStudentsAdmin
                : t.noStudentsPublic
              : t.noSearchResults}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredStudents.map(
            (student) => (
              <StudentCard
                key={student.id}
                student={student}
                rank={
                  rankMap.get(
                    student.id
                  ) ?? 0
                }
                isAdmin={isAdmin}
                allStudents={
                  students
                }
                showPoints={
                  showPoints
                }
                pointsPending={
                  pendingPointsId ===
                  student.id
                }
                onAddPoint={() =>
                  handlePointChange(
                    student,
                    1
                  )
                }
                onSubtractPoint={() =>
                  handlePointChange(
                    student,
                    -1
                  )
                }
                onViewTracking={() =>
                  setTrackingStudent(
                    student
                  )
                }
                onEdit={() => {
                  setFormError(
                    null
                  );

                  setFormModal({
                    mode: "edit",
                    student,
                  });
                }}
                onDelete={() => {
                  setDeleteError(
                    null
                  );

                  setDeleteTarget(
                    student
                  );
                }}
              />
            )
          )}
        </div>
      )}

      {/* نموذج الطالب */}
      {formModal && (
        <StudentFormModal
          mode={
            formModal.mode
          }
          initialStudent={
            formModal.mode ===
            "edit"
              ? formModal.student
              : undefined
          }
          submitting={
            formSubmitting
          }
          errorMessage={
            formError
          }
          onSubmit={
            handleFormSubmit
          }
          onClose={() => {
            if (
              !formSubmitting
            ) {
              setFormModal(
                null
              );
            }
          }}
        />
      )}

            {/* تأكيد الحذف */}
      {deleteTarget && (
        <DeleteConfirmModal
          studentName={deleteTarget.full_name}
          submitting={deleteSubmitting}
          errorMessage={deleteError}
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            if (!deleteSubmitting) {
              setDeleteTarget(null);
            }
          }}
        />
      )}

      {/* متابعة الحفظ */}
      {trackingStudent && (
        <MemorizationModal
          student={trackingStudent}
          isAdmin={isAdmin}
          onClose={() => {
            setTrackingStudent(null);
          }}
        />
      )}
    </div>
  );
}
