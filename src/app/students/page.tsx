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

  // الصفحة عامة بالكامل: لا يوجد أي redirect أو منع عرض لغير المسجّلين.
  // صلاحية الأدمن تُحدَّد عبر البريد الإلكتروني فقط.
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

        <StudentsManager initialStudents={(students as Student[]) ?? []} role={role} />
      </div>
    </div>
  );
}
