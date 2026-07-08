"use client";

import { useEffect, useRef, useState } from "react";
import type { Student } from "@/types/database.types";
import StudentAvatar from "./StudentAvatar";
import ProgressBar from "./ProgressBar";
import { getSavedLocale, getTranslations } from "@/lib/i18n";

const RANK_BADGES: Record<number, string> = {
  1: "🥇",
  2: "🥈",
  3: "🥉",
};

const RANK_RING: Record<number, string> = {
  1: "ring-2 ring-gold/60",
  2: "ring-2 ring-slate-300/70",
  3: "ring-2 ring-amber-700/40",
};

export default function StudentCard({
  student,
  rank,
  isAdmin,
  onEdit,
  onDelete,
  onAddPoint,
  onSubtractPoint,
  pointsPending,
}: {
  student: Student;
  rank: number;
  isAdmin: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onAddPoint: () => void;
  onSubtractPoint: () => void;
  pointsPending?: boolean;
}) {
  const [celebrate, setCelebrate] = useState(false);
  const prevPoints = useRef(student.points);
  const t = getTranslations(getSavedLocale());

  // تأثير تحفيزي بسيط جدًا عند الوصول إلى محطة (50، 100، 150 ...)
  useEffect(() => {
    const prev = prevPoints.current;
    if (student.points > prev && student.points % 50 === 0 && student.points !== 0) {
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 1100);
      prevPoints.current = student.points;
      return () => clearTimeout(t);
    }
    prevPoints.current = student.points;
  }, [student.points]);

  const ring = rank <= 3 ? RANK_RING[rank] : "";

  return (
    <div
      className={`group relative flex flex-col items-center rounded-2xl border border-emerald-100 bg-white px-5 py-6 text-center shadow-sm transition hover:-translate-y-1 hover:shadow-ornate ${ring} ${
        celebrate ? "animate-[pulse_0.55s_ease-in-out_2]" : ""
      }`}
    >
      {rank <= 3 && (
        <span
          className="absolute -top-3 right-1/2 translate-x-1/2 text-xl drop-shadow-sm"
          aria-hidden="true"
        >
          {RANK_BADGES[rank]}
        </span>
      )}

      {celebrate && (
        <span
          className="pointer-events-none absolute -top-4 text-lg animate-bounce"
          aria-hidden="true"
        >
          ✨
        </span>
      )}

      {isAdmin && (
        <div className="absolute top-3 left-3 flex items-center gap-1.5 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
          <button
            type="button"
            onClick={onEdit}
            aria-label={`تعديل اسم ${student.full_name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-100 bg-sand-50 text-emerald-700 transition hover:bg-emerald-50"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
              <path
                d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={onDelete}
            aria-label={`حذف ${student.full_name}`}
            className="flex h-7 w-7 items-center justify-center rounded-full border border-red-100 bg-sand-50 text-red-600 transition hover:bg-red-50"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" aria-hidden="true">
              <path
                d="M5 7h14M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-8 0 1 13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1l1-13"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      )}

      <StudentAvatar name={student.full_name} photoUrl={student.photo_url} size="lg" />

      <h3 className="mt-4 line-clamp-2 text-base font-bold text-emerald-800">
        {student.full_name}
      </h3>

      <span className="mt-3 inline-flex items-center gap-1 rounded-full border border-gold/40 bg-gold-light/30 px-3 py-1 text-xs font-semibold text-gold-deep">
        {student.points} {t.points}
      </span>

      <div className="mt-4 w-full">
        <ProgressBar points={student.points} size="sm" />
      </div>

      {isAdmin && (
        <div className="mt-4 flex w-full items-center justify-center gap-2">
          <button
            type="button"
            onClick={onSubtractPoint}
            disabled={pointsPending || student.points <= 0}
            aria-label={`إنقاص نقطة من ${student.full_name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={onAddPoint}
            disabled={pointsPending}
            aria-label={`إضافة نقطة لـ ${student.full_name}`}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
