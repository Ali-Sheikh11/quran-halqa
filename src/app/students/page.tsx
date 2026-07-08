import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";
import IslamicPattern from "@/components/IslamicPattern";
import QuranicBanner from "@/components/students/QuranicBanner";
import StudentsManager from "@/components/students/StudentsManager";
import type { Student } from "@/types/database.types";

export const metadata = {
  title: "الطلاب | منارة القرآن",
};

export default async function StudentsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const role: "admin" | "viewer" = isAdminEmail(user?.email) ? "admin" : "viewer";

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-sand-100/50">
      <IslamicPattern className="opacity-[0.03]" />
      <div className="relative mx-auto max-w-6xl px-5 py-10 sm:py-12">
        <div className="mb-8">
          <QuranicBanner />
        </div>

        <div className="mb-6">
          <h1 className="font-verse text-2xl font-bold text-emerald-800 sm:text-3xl">
            الطلاب
          </h1>
          <p className="mt-1 text-sm text-night/60">
            {role === "admin"
              ? "يمكنك إضافة طلاب جدد، وتعديل أسمائهم وصورهم، أو حذفهم."
              : "عرض قائمة طلاب الحلقة الحالية."}
          </p>
        </div>

        <div className="mb-8 rounded-xl border border-emerald-100/50 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-5 font-verse text-xl font-bold text-emerald-800 sm:text-2xl">
            📋 آلية احتساب النقاط
          </h2>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            <li className="flex items-center gap-2 text-base font-medium text-night">
              <span className="text-lg">📖</span> الحفظ والمراجعة
            </li>
            <li className="flex items-center gap-2 text-base font-medium text-night">
              <span className="text-lg">🎙️</span> جودة التسميع
            </li>
            <li className="flex items-center gap-2 text-base font-medium text-night">
              <span className="text-lg">📅</span> المواظبة على الحضور
            </li>
            <li className="flex items-center gap-2 text-base font-medium text-night">
              <span className="text-lg">🤝</span> حسن التعاون
            </li>
            <li className="flex items-center gap-2 text-base font-medium text-night">
              <span className="text-lg">🌿</span> الأدب وحسن الخلق
            </li>
            <li className="flex items-center gap-2 text-base font-medium text-night">
              <span className="text-lg">💡</span> المشاركة والاجتهاد
            </li>
            <li className="flex items-center gap-2 text-base font-medium text-night">
              <span className="text-lg">🕌</span> احترام آداب الحلقة
            </li>
          </ul>
          <p className="mt-6 text-sm font-medium leading-relaxed text-night/70">
            النقاط وسيلة للتشجيع والتحفيز، وهدفها غرس حب القرآن، وحسن الخلق، والالتزام بآداب الحلقة، وليست معيارًا للتفاضل بين الطلاب.
          </p>
        </div>

        <StudentsManager initialStudents={(students as Student[]) ?? []} role={role} />
      </div>
    </div>
  );
}
