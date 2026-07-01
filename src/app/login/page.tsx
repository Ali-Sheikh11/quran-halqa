import { Suspense } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import LoginForm from "@/components/LoginForm";
import IslamicPattern from "@/components/IslamicPattern";

export const metadata = {
  title: "دخول المسؤول | منارة القرآن",
};

export default async function LoginPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // إن كان مسجّلاً دخوله بالفعل، لا داعي لإظهار صفحة الدخول من جديد
  if (user) {
    redirect("/admin");
  }

  return (
    <section className="relative flex min-h-[calc(100vh-64px)] items-center justify-center overflow-hidden bg-gradient-to-b from-emerald-800 to-emerald-700 px-5 py-16">
      <IslamicPattern />

      <div className="relative w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="font-verse text-2xl font-bold text-sand">منارة القرآن</span>
          <p className="mt-2 text-sm text-sand/80">
            دخول خاص بحسابات المعلّم/المسؤول لإدارة المنصة ومتابعتها
          </p>
        </div>

        <div className="corner-ornament relative rounded-2xl border border-gold/30 bg-white px-6 py-8 shadow-ornate sm:px-8">
          <Suspense fallback={<div className="text-center text-sm text-night/50">جارٍ التحميل...</div>}>
            <LoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-sand/70">
          هذه الصفحة مخصّصة للحسابات المُسجَّلة مسبقًا فقط (مسؤول أو معلم)، ولا يوجد تسجيل عام للزوّار.
        </p>
      </div>
    </section>
  );
}
