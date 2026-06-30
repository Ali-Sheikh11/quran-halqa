import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "لوحة التحكم | منارة القرآن",
};

export default async function AdminDashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { count: studentsCount } = await supabase
    .from("students")
    .select("*", { count: "exact", head: true });

  return (
    <div className="mx-auto max-w-4xl px-5 py-12">
      <div className="mb-8">
        <p className="text-sm text-emerald-600">أهلًا بك،</p>
        <h1 className="font-verse text-2xl font-bold text-emerald-800 sm:text-3xl">
          {user?.email}
        </h1>
        <p className="mt-2 text-sm text-night/60">
          هذه لوحة التحكم الخاصة بمسؤول الحلقة. تم التحقق من صلاحيتك بنجاح عبر جلسة آمنة على مستوى السيرفر.
        </p>
      </div>

      <Link
        href="/students"
        className="group flex items-center justify-between rounded-2xl border border-emerald-100 bg-white px-6 py-7 shadow-sm transition hover:-translate-y-1 hover:shadow-ornate"
      >
        <div className="flex items-center gap-4">
          <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50">
            <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden="true">
              <path
                d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0"
                fill="none"
                stroke="#0F6B45"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <h2 className="mb-1 text-lg font-bold text-emerald-800">إدارة الطلاب</h2>
            <p className="text-sm leading-relaxed text-night/60">
              {studentsCount ?? 0} {studentsCount === 1 ? "طالب مسجَّل" : "طالبًا مسجَّلين"} —
              إضافة، تعديل، حذف، وبحث فوري.
            </p>
          </div>
        </div>
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0 text-emerald-600 transition group-hover:-translate-x-1"
          aria-hidden="true"
        >
          <path d="m9 6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
    </div>
  );
}
