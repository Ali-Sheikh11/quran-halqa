// src/app/students/page.tsx
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

        <StudentsPageClient
          role={role}
          initialStudents={(students as Student[]) ?? []}
        />
      </div>
    </div>
  );
}
