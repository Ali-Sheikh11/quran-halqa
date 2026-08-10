import type { Student } from "@/types/database.types";
import StudentAvatar from "./StudentAvatar";
import { getStudentStatus, getDailyPoints } from "@/lib/students/status";

const MEDALS = [
  { icon: "🥇", chip: "bg-gold text-night", label: "الأول" },
  { icon: "🥈", chip: "bg-slate-300 text-night", label: "الثاني" },
  { icon: "🥉", chip: "bg-amber-700/80 text-sand", label: "الثالث" },
] as const;

/**
 * قاعة الشرف:
 * - الأدمن: يرى أفضل الطلاب بالنقاط الإجمالية
 * - الزوار: يرون المتميزين في الحالة اليومية فقط
 */
export default function HallOfFame({
  students,
  isAdmin = false,
}: {
  students: Student[];
  isAdmin?: boolean;
}) {
  if (isAdmin) {
    return <AdminHallOfFame students={students} />;
  }
  return <ViewerHallOfFame students={students} />;
}

/** قاعة الشرف للأدمن — مرتبة بالنقاط الإجمالية */
function AdminHallOfFame({ students }: { students: Student[] }) {
  const sorted = [...students]
    .filter((s) => s.points > 0)
    .sort((a, b) => b.points - a.points);

  if (sorted.length === 0) return null;

  const groups: Student[][] = [];
  for (const student of sorted) {
    const last = groups[groups.length - 1];
    if (last && last[0].points === student.points) {
      last.push(student);
    } else {
      groups.push([student]);
    }
  }

  const topGroups = groups.slice(0, 3);

  return (
    <HallOfFameCard title="🏅 قاعة الشرف">
      <div className="flex flex-col gap-6">
        {topGroups.map((group, groupIndex) => {
          const medal = MEDALS[groupIndex];
          const isFirst = groupIndex === 0;
          return (
            <div key={groupIndex}>
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="text-xl" aria-hidden="true">{medal.icon}</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${medal.chip}`}>
                  {medal.label} — {group[0].points} نقطة
                </span>
              </div>
              <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
                {group.map((student) => (
                  <div key={student.id} className="relative flex flex-col items-center">
                    <span className="absolute -top-2 right-1/2 translate-x-1/2 text-lg"
                      aria-hidden="true">{medal.icon}</span>
                    <StudentAvatar
                      name={student.full_name}
                      photoUrl={student.photo_url}
                      size={isFirst ? "lg" : "md"}
                    />
                    <p className="mt-2 max-w-[7.5rem] truncate text-sm font-bold text-emerald-800">
                      {student.full_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </HallOfFameCard>
  );
}

/** قاعة الشرف للزوار — تعرض المتميزين في الحالة اليومية */
function ViewerHallOfFame({ students }: { students: Student[] }) {
  // نأخذ فقط من عنده نقاط اليوم > 0 ونرتبهم تنازلياً
  const topStudents = [...students]
    .filter((s) => getDailyPoints(s) > 0)
    .sort((a, b) => getDailyPoints(b) - getDailyPoints(a))
    .slice(0, 5); // أفضل 5 اليوم

  if (topStudents.length === 0) return null;

  return (
    <HallOfFameCard title="🌟 متميزو اليوم">
      <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
        {topStudents.map((student) => {
          const status = getStudentStatus(student);
          return (
            <div key={student.id} className="flex flex-col items-center">
              <StudentAvatar
                name={student.full_name}
                photoUrl={student.photo_url}
                size="md"
              />
              <p className="mt-2 max-w-[7.5rem] truncate text-sm font-bold text-emerald-800">
                {student.full_name}
              </p>
              <span className="mt-1 text-sm">{status.emoji}</span>
              <span className="text-[11px] text-emerald-700">{status.label}</span>
            </div>
          );
        })}
      </div>
    </HallOfFameCard>
  );
}

function HallOfFameCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="corner-ornament relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-emerald-50 to-white px-5 py-7 shadow-sm">
      <h2 className="mb-6 text-center font-verse text-lg font-bold text-emerald-800 sm:text-xl">
        {title}
      </h2>
      {children}
    </div>
  );
}
