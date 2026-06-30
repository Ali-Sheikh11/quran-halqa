"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import type { Student } from "@/types/database.types";
import { validateStudentPhoto } from "@/lib/students/storage";
import StudentAvatar from "./StudentAvatar";

export type StudentFormSubmitData = {
  name: string;
  file: File | null;
};

export default function StudentFormModal({
  mode,
  initialStudent,
  submitting,
  errorMessage,
  onSubmit,
  onClose,
}: {
  mode: "add" | "edit";
  initialStudent?: Student;
  submitting: boolean;
  errorMessage: string | null;
  onSubmit: (data: StudentFormSubmitData) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(initialStudent?.full_name ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialStudent?.photo_url ?? null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ننظّف رابط المعاينة المحلي عند تغييره أو إزالة المكوّن لتفادي تسرّب الذاكرة
  useEffect(() => {
    return () => {
      if (file && previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    const validationError = validateStudentPhoto(selected);
    if (validationError) {
      setFileError(validationError);
      return;
    }

    setFileError(null);
    setFile(selected);
    setPreviewUrl(URL.createObjectURL(selected));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, file });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-night/50 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget && !submitting) onClose();
      }}
    >
      <div className="corner-ornament relative w-full max-w-sm rounded-2xl border border-gold/30 bg-white p-6 shadow-ornate sm:p-7">
        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          aria-label="إغلاق"
          className="absolute left-4 top-4 text-night/40 transition hover:text-night/70 disabled:opacity-40"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path
              d="M6 6l12 12M18 6 6 18"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h2 className="mb-5 text-center text-lg font-bold text-emerald-800">
          {mode === "add" ? "إضافة طالب جديد" : "تعديل بيانات الطالب"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
          <div className="flex flex-col items-center gap-3">
            <StudentAvatar name={name || "؟"} photoUrl={previewUrl} size="lg" />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={submitting}
              className="rounded-full border border-emerald-200 px-4 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-50 disabled:opacity-50"
            >
              {previewUrl ? "تغيير الصورة" : "اختيار صورة"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            {fileError && <p className="text-xs text-red-600">{fileError}</p>}
          </div>

          <div>
            <label htmlFor="student-name" className="mb-1.5 block text-sm font-medium text-night/80">
              اسم الطالب
            </label>
            <input
              id="student-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
              autoFocus
              className="w-full rounded-xl border border-emerald-100 bg-sand-50 px-4 py-2.5 text-night outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:opacity-60"
              placeholder="مثال: أحمد محمد"
            />
          </div>

          {errorMessage && (
            <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
              {errorMessage}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 rounded-xl border border-emerald-100 py-2.5 text-sm font-semibold text-night/70 transition hover:bg-sand-100 disabled:opacity-50"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 rounded-xl bg-emerald-600 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
            >
              {submitting ? "جارٍ الحفظ..." : mode === "add" ? "إضافة" : "حفظ التعديلات"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
