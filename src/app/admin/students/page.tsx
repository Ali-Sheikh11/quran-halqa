import { createClient } from "@/lib/supabase/server";
import { isAdminEmail } from "@/lib/auth/admin";
import StudentsManager from "@/components/students/StudentsManager";
import type { Student } from "@/types/database.types";

export const metadata = { title: "إدارة الطلاب | منارة القرآن" };

export default async function AdminStudentsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const role: "admin" | "viewer" = isAdminEmail(user?.email) ? "admin" : "viewer";

  const { data: students } = await supabase
    .from("students")
    .select("*")
    .order("points", { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="font-verse text-2xl font-bold text-emerald-800">
        👥 إدارة الطلاب
      </h1>
      <StudentsManager
        initialStudents={(students as Student[]) ?? []}
        role={role}
      />
    </div>
  );
}
