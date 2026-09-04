import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";
import { loadSettings } from "@/lib/supabase/settings";
import IslamicPattern from "@/components/IslamicPattern";
import QuranicBanner from "@/components/students/QuranicBanner";
import StudentsManager from "@/components/students/StudentsManager";
import SessionEndedScreen from "@/components/students/SessionEndedScreen";
import type { Student } from "@/types/database.types";

export const metadata = { title: "الطلاب | منارة القرآن" };

export default async function StudentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role: "admin" | "viewer" = isAdminEmail(user?.email) ? "admin" : "viewer";

  const [{ data: students }, settings] = await Promise.all([
    supabase.from("students").select("*").order("created_at", { ascending: false }),
    loadSettings(supabase),
  ]);

  const allStudents = (students as Student[]) ?? [];

  // وضع الصيانة
  if (settings.maintenance_mode && role !== "admin") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-5">
        <div className="text-center">
          <p className="text-4xl">🔧</p>
          <h1 className="mt-4 font-verse text-2xl font-bold text-emerald-800">وضع الصيانة</h1>
          <p className="mt-2 text-night/60">{settings.maintenance_message}</p>
        </div>
      </div>
    );
  }

  // انتهاء الدورة — يظهر للجميع (الأدمن يرى النتائج + زر للعودة)
  if (settings.session_ended) {
    return (
      <SessionEndedScreen
        students={allStudents}
        sessionName={settings.session_name}
        isAdmin={role === "admin"}
      />
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-sand-100/50">
      <IslamicPattern className="opacity-[0.03]" />
      <div className="relative mx-auto max-w-6xl px-5 py-10 sm:py-12">
        <div className="mb-8">
          <QuranicBanner />
          {role === "viewer" && (
            <p className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-center text-sm text-emerald-700">
              التقييم وسيلة للتشجيع، وكل يوم فرصة جديدة للتقدم والإخلاص والاجتهاد. 🌱
            </p>
          )}
        </div>

        <div className="mb-6">
          <h1 className="font-verse text-2xl font-bold text-emerald-800 sm:text-3xl">الطلاب</h1>
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
            {[
              { icon: "📖", text: "الحفظ والمراجعة" },
              { icon: "🎙️", text: "جودة التسميع" },
              { icon: "📅", text: "المواظبة على الحضور" },
              { icon: "🤝", text: "حسن التعاون" },
              { icon: "🌿", text: "الأدب وحسن الخلق" },
              { icon: "💡", text: "المشاركة والاجتهاد" },
              { icon: "🕌", text: "احترام آداب الحلقة" },
            ].map((item) => (
              <li key={item.text} className="flex items-center gap-2 text-base font-medium text-night">
                <span className="text-lg">{item.icon}</span> {item.text}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm font-medium leading-relaxed text-night/70">
            النقاط وسيلة للتشجيع والتحفيز، وهدفها غرس حب القرآن، وحسن الخلق، والالتزام بآداب الحلقة، وليست معيارًا للتفاضل بين الطلاب.
          </p>
        </div>

        <StudentsManager
          initialStudents={allStudents}
          role={role}
          settings={settings}
        />
      </div>
    </div>
  );
}
