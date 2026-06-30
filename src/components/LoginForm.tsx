"use client";

import { useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isAdminEmail } from "@/lib/auth/admin";

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = createClient();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.user) {
      setLoading(false);
      setError("بيانات الدخول غير صحيحة. يرجى التحقق من البريد الإلكتروني وكلمة المرور.");
      return;
    }

    // نحدّد الوجهة بحسب البريد الإلكتروني (admin أم لا) وليس افتراضيًا
    setLoading(false);

    const redirectedFrom = searchParams.get("redirectedFrom");
    const fallback = isAdminEmail(signInData.user.email) ? "/admin" : "/students";
    router.push(redirectedFrom || fallback);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" dir="rtl">
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-night/80">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-xl border border-emerald-100 bg-sand-50 px-4 py-2.5 text-night outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          placeholder="admin@example.com"
          autoComplete="email"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-night/80">
          كلمة المرور
        </label>
        <input
          id="password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl border border-emerald-100 bg-sand-50 px-4 py-2.5 text-night outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100"
          placeholder="••••••••"
          autoComplete="current-password"
        />
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2.5 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {loading ? "جارٍ التحقق..." : "تسجيل الدخول"}
      </button>
    </form>
  );
}
