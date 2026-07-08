"use client";

import { useState, useEffect } from "react";
import type { Student } from "@/types/database.types";
import { getSavedLocale, getTranslations } from "@/lib/i18n";

/**
 * شريط إحصائيات بسيط أعلى صفحة الطلاب: عدد الطلاب، مجموع النقاط،
 * المتوسط، وأفضل طالب. عام بالكامل — لا يحتاج تسجيل دخول.
 */
export default function StatsBar({ students }: { students: Student[] }) {
  const [locale, setLocale] = useState(() => getSavedLocale());

  useEffect(() => {
    setLocale(getSavedLocale());
  }, []);

  const t = getTranslations(locale);

  const count = students.length;
  const total = students.reduce((sum, s) => sum + s.points, 0);
  const average = count > 0 ? Math.round(total / count) : 0;
  const top = count > 0 ? [...students].sort((a, b) => b.points - a.points)[0] : null;

  const items = [
    { label: t.statsStudents, value: count.toLocaleString() },
    { label: t.statsTotal,    value: total.toLocaleString() },
    { label: t.statsAverage,  value: average.toLocaleString() },
    { label: t.statsTop,      value: top ? top.full_name : t.statsNone },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {items.map((item) => (
        <div
          key={item.label}
          className="rounded-2xl border border-emerald-100 bg-white px-4 py-4 text-center shadow-sm"
        >
          <p className="truncate text-base font-bold text-emerald-800 sm:text-lg" title={item.value}>
            {item.value}
          </p>
          <p className="mt-1 text-[11px] font-medium text-night/50 sm:text-xs">{item.label}</p>
        </div>
      ))}
    </div>
  );
}
