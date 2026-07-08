// src/components/LangToggle.tsx
"use client";

import { useEffect, useState } from "react";
import { getSavedLocale, saveLocale, type Locale } from "@/lib/i18n";

export default function LangToggle() {
  const [locale, setLocale] = useState<Locale>("ar");

  useEffect(() => {
    setLocale(getSavedLocale());
  }, []);

  function toggle() {
    const next: Locale = locale === "ar" ? "tr" : "ar";
    saveLocale(next);
    setLocale(next);
    // إعادة تحميل الصفحة لتطبيق اللغة على كل المكوّنات
    window.location.reload();
  }

  const flag  = locale === "ar" ? "🇹🇷" : "🇸🇦";
  const label = locale === "ar" ? "Türkçe" : "العربية";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`التبديل إلى ${label}`}
      className="flex h-8 items-center gap-1.5 rounded-full border border-gold/40 px-2.5 text-sand transition hover:bg-white/10"
    >
      <span className="text-base leading-none">{flag}</span>
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}
