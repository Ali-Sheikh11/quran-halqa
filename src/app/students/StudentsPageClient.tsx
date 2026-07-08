// src/app/students/StudentsPageClient.tsx
"use client";

import { getSavedLocale, getTranslations } from "@/lib/i18n";
import StudentsManager from "@/components/students/StudentsManager";
import type { Student } from "@/types/database.types";

export default function StudentsPageClient({
  role,
  initialStudents,
}: {
  role: "admin" | "viewer";
  initialStudents: Student[];
}) {
  const t = getTranslations(getSavedLocale());

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-verse text-2xl font-bold text-emerald-800 sm:text-3xl">
          {t.studentsTitle}
        </h1>
        <p className="mt-1 text-sm text-night/60">
          {role === "admin" ? t.studentsDescAdmin : t.studentsDescViewer}
        </p>
      </div>

      <div className="mb-8 rounded-xl border border-emerald-100/50 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 font-verse text-xl font-bold text-emerald-800 sm:text-2xl">
          {t.pointsSystemTitle}
        </h2>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[
            { icon: "📖", text: t.pointsItem1 },
            { icon: "🎙️", text: t.pointsItem2 },
            { icon: "📅", text: t.pointsItem3 },
            { icon: "🤝", text: t.pointsItem4 },
            { icon: "🌿", text: t.pointsItem5 },
            { icon: "💡", text: t.pointsItem6 },
            { icon: "🕌", text: t.pointsItem7 },
          ].map((item) => (
            <li key={item.text} className="flex items-center gap-2 text-base font-medium text-night">
              <span className="text-lg">{item.icon}</span> {item.text}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm font-medium leading-relaxed text-night/70">
          {t.pointsSystemNote}
        </p>
      </div>

      <StudentsManager initialStudents={initialStudents} role={role} />
    </div>
  );
}
