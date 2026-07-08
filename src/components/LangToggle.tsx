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
    window.location.reload();
  }

  const flag  = locale === "ar" ? "🇹🇷" : "🇸🇦";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="تبديل اللغة"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/40 text-base text-sand transition hover:bg-white/10"
    >
      {flag}
    </button>
  );
}
