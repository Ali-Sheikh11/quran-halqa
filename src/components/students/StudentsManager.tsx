"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Student } from "@/types/database.types";
import { deleteStudentPhoto, uploadStudentPhoto } from "@/lib/students/storage";
import StudentCard from "./StudentCard";
import StudentFormModal, { type StudentFormSubmitData } from "./StudentFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import StatsBar from "./StatsBar";
import HallOfFame from "./HallOfFame";

type FormModalState =
  | { mode: "add" }
  | { mode: "edit"; student: Student }
  | null;

export default function StudentsManager({
  initialStudents,
  role,
}: {
  initialStudents: Student[];
  role: "admin" | "viewer";
}) {
  const isAdmin = role === "admin";
  const [supabase] = useState(() => createClient());

  const [students, setStudents] = useState<Student[]>(initialStudents);
  const [searchTerm, setSearchTerm] = useState("");
  const [formModal, setFormModal] = useState<FormModalState>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingPointsId, setPendingPointsId] = useState<string | null>(null);

  // Supabase هو المصدر الوحيد للحقيقة: نشترك في تغييرات الجدول مباشرة
  // فتنعكس أي إضافة/تعديل/حذف على كل من يشاهد الصفحة فورًا بدون reload.
  useEffect(() => {
    const channel = supabase
      .channel("students-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        (payload) => {
          setStudents((prev) => {
            if (payload.eventType === "INSERT") {
              const incoming = payload.new as Student;
              if (prev.some((s) => s.id === incoming.id)) return prev;
              return [incoming, ...prev];
            }
            if (payload.eventType === "UPDATE") {
              const updated = payload.new as Student;
              return prev.map((s) => (s.id === updated.id ? updated : s));
            }
            if (payload.eventType === "DELETE") {
              const removedId = (payload.old as Partial<Student>).id;
              return prev.filter((s) => s.id !== removedId);
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

  // الترتيب التلقائي: تنازليًا حسب النقاط، وعند التساوي يُقدَّم الأقدم انضمامًا
  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      return a.created_at.localeCompare(b.created_at);
    });
  }, [students]);

  const rankMap = useMemo(() => {
    const map = new Map<string, number>();
    sortedStudents.forEach((s, i) => map.set(s.id, i + 1));
    return map;
  }, [sortedStudents]);

  const filteredStudents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return sortedStudents;
    return sortedStudents.filter((s) => s.full_name.toLowerCase().includes(term));
  }, [sortedStudents, searchTerm]);

  async function handleFormSubmit(data: StudentFormSubmitData) {
    setFormSubmitting(true);
    setFormError(null);

    try {
      if (formModal?.mode === "add") {
        const id = crypto.randomUUID();
        let photoUrl: string | null = null;

        if (data.file) {
          photoUrl = await uploadStudentPhoto(supabase, id, data.file);
        }

        const { data: userData } = await supabase.auth.getUser();
        const { error } = await supabase.from("students").insert({
          id,
          full_name: data.name,
          photo_url: photoUrl,
          created_by: userData.user?.id ?? null,
        });

        if (error) throw new Error(`تعذّرت إضافة الطالب: ${error.message}`);
      } else if (formModal?.mode === "edit") {
        const studentId = formModal.student.id;
        let photoUrl = formModal.student.photo_url;

        if (data.file) {
          photoUrl = await uploadStudentPhoto(supabase, studentId, data.file);
        }

        const { error } = await supabase
          .from("students")
          .update({ full_name: data.name, photo_url: photoUrl })
          .eq("id", studentId);

        if (error) throw new Error(`تعذّر حفظ التعديلات: ${error.message}`);
      }

      setFormModal(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "حدث خطأ غير متوقع.");
    } finally {
      setFormSubmitting(false);
    }
  }

  async function handlePointChange(student: Student, delta: number) {
    const newPoints = Math.max(0, student.points + delta);
    if (newPoints === student.points) return;

    setPendingPointsId(student.id);
    const previousPoints = student.points;

    // تحديث متفائل فوري بدون انتظار الشبكة، Supabase يبقى مصدر الحقيقة
    setStudents((prev) =>
      prev.map((s) => (s.id === student.id ? { ...s, points: newPoints } : s))
    );

    const { error } = await supabase
      .from("students")
      .update({ points: newPoints })
      .eq("id", student.id);

    if (error) {
      // فشل التحديث: نعيد القيمة السابقة
      setStudents((prev) =>
        prev.map((s) => (s.id === student.id ? { ...s, points: previousPoints } : s))
      );
    }
    setPendingPointsId(null);
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    setDeleteError(null);

    try {
      await deleteStudentPhoto(supabase, deleteTarget.id);
      const { error } = await supabase.from("students").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      setDeleteTarget(null);
    } catch {
      // نُبقي مربع التأكيد مفتوحًا مع رسالة الخطأ ليحاول المستخدم مجددًا
      setDeleteError("تعذّر حذف الطالب. الرجاء المحاولة مرة أخرى.");
    } finally {
      setDeleteSubmitting(false);
    }
  }

  return (
    <div>
      {/* إحصائيات عامة */}
      <div className="mb-6">
        <StatsBar students={students} />
      </div>

      {/* قاعة الشرف: أفضل 3 طلاب */}
      <div className="mb-8">
        <HallOfFame students={students} />
      </div>

      {/* شريط الأدوات: البحث + زر الإضافة */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <svg
            viewBox="0 0 24 24"
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-night/40"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث باسم الطالب..."
            className="w-full rounded-xl border border-emerald-100 bg-white py-2.5 pr-10 pl-4 text-sm text-night outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          />
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => {
              setFormError(null);
              setFormModal({ mode: "add" });
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            إضافة طالب
          </button>
        )}
      </div>

      {/* عدّاد بسيط */}
      <p className="mb-4 text-sm text-night/50">
        {filteredStudents.length} {filteredStudents.length === 1 ? "طالب" : "طالبًا"}
        {searchTerm && ` من أصل ${students.length}`}
      </p>

      {/* شبكة بطاقات الطلاب */}
      {filteredStudents.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-emerald-200 bg-white px-6 py-14 text-center">
          <p className="text-sm text-night/50">
            {students.length === 0
              ? isAdmin
                ? "لا يوجد طلاب بعد. اضغط على «إضافة طالب» للبدء."
                : "لا يوجد طلاب مسجَّلون بعد."
              : "لا توجد نتائج مطابقة لبحثك."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {filteredStudents.map((student) => (
            <StudentCard
              key={student.id}
              student={student}
              rank={rankMap.get(student.id) ?? 0}
              isAdmin={isAdmin}
              pointsPending={pendingPointsId === student.id}
              onAddPoint={() => handlePointChange(student, 1)}
              onSubtractPoint={() => handlePointChange(student, -1)}
              onEdit={() => {
                setFormError(null);
                setFormModal({ mode: "edit", student });
              }}
              onDelete={() => {
                setDeleteError(null);
                setDeleteTarget(student);
              }}
            />
          ))}
        </div>
      )}

      {formModal && (
        <StudentFormModal
          mode={formModal.mode}
          initialStudent={formModal.mode === "edit" ? formModal.student : undefined}
          submitting={formSubmitting}
          errorMessage={formError}
          onSubmit={handleFormSubmit}
          onClose={() => {
            if (!formSubmitting) setFormModal(null);
          }}
        />
      )}

      {deleteTarget && (
        <DeleteConfirmModal
          studentName={deleteTarget.full_name}
          submitting={deleteSubmitting}
          errorMessage={deleteError}
          onConfirm={handleDeleteConfirm}
          onClose={() => {
            if (!deleteSubmitting) setDeleteTarget(null);
          }}
        />
      )}
    </div>
  );
}
