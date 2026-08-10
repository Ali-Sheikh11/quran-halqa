import type { Student } from "@/types/database.types";
import StudentAvatar from "./StudentAvatar";
import { getStudentStatus, getDailyPoints } from "@/lib/students/status";

/**
 * قاعة الشرف — تعرض متميزي اليوم للجميع بالحالة اليومية بدون نقاط.
 * تظهر فقط من عنده نقاط اليوم > 0، مرتبين تنازلياً.
 */
export default function HallOfFame({ students }: { students: Student[] }) {
  const topStudents = [...students]
    .filter((s) => getDailyPoints(s) > 0)
    .sort((a, b) => getDailyPoints(b) - getDailyPoints(a))
    .slice(0, 5);

  if (topStudents.length === 0) return null;

  return (
    <div className="corner-ornament relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-emerald-50 to-white px-5 py-7 shadow-sm">
      <h2 className="mb-6 text-center font-verse text-lg font-bold text-emerald-800 sm:text-xl">
        🌟 متميزو اليوم
      </h2>

      <div className="flex flex-wrap items-end justify-center gap-5 sm:gap-8">
        {topStudents.map((student, index) => {
          const status = getStudentStatus(student, students);
          const isFirst = index === 0;

          return (
            <div key={student.id} className="flex flex-col items-center">
              <StudentAvatar
                name={student.full_name}
                photoUrl={student.photo_url}
                size={isFirst ? "lg" : "md"}
              />
              <p className="mt-2 max-w-[7.5rem] truncate text-sm font-bold text-emerald-800">
                {student.full_name}
              </p>
              <span className="mt-1 text-base">{status.emoji}</span>
              <span className="text-[11px] font-medium text-emerald-700">
                {status.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-[11px] text-night/40">
        يتجدد كل يوم — كل يوم فرصة جديدة 🌱
      </p>
    </div>
  );
}
