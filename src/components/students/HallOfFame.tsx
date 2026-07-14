import type { Student } from "@/types/database.types";
import StudentAvatar from "./StudentAvatar";

const MEDALS = [
  { icon: "🥇", ring: "border-gold ring-4 ring-gold/30", chip: "bg-gold text-night", label: "الأول" },
  { icon: "🥈", ring: "border-slate-300 ring-4 ring-slate-200/60", chip: "bg-slate-300 text-night", label: "الثاني" },
  { icon: "🥉", ring: "border-amber-700/70 ring-4 ring-amber-700/20", chip: "bg-amber-700/80 text-sand", label: "الثالث" },
] as const;

/**
 * قاعة الشرف: أفضل الطلاب حسب النقاط مع دعم التعادل.
 * عند التعادل يظهر جميع المتعادلين في نفس المرتبة.
 */
export default function HallOfFame({ students }: { students: Student[] }) {
  const sorted = [...students]
    .filter((s) => s.points > 0)
    .sort((a, b) => b.points - a.points);

  if (sorted.length === 0) return null;

  // نجمع الطلاب في مجموعات حسب النقاط
  // مثال: [28,28,20,20,15] → [[28,28],[20,20],[15]]
  const groups: Student[][] = [];
  for (const student of sorted) {
    const last = groups[groups.length - 1];
    if (last && last[0].points === student.points) {
      last.push(student);
    } else {
      groups.push([student]);
    }
  }

  // نأخذ المجموعات الثلاث الأولى فقط (المركز 1، 2، 3)
  const topGroups = groups.slice(0, 3);

  return (
    <div className="corner-ornament relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-emerald-50 to-white px-5 py-7 shadow-sm">
      <h2 className="mb-6 text-center font-verse text-lg font-bold text-emerald-800 sm:text-xl">
        🏅 قاعة الشرف
      </h2>

      <div className="flex flex-col gap-6">
        {topGroups.map((group, groupIndex) => {
          const medal = MEDALS[groupIndex];
          const isFirst = groupIndex === 0;

          return (
            <div key={groupIndex}>
              {/* شارة المرتبة */}
              <div className="mb-3 flex items-center justify-center gap-2">
                <span className="text-xl" aria-hidden="true">{medal.icon}</span>
                <span className={`rounded-full px-3 py-0.5 text-xs font-bold ${medal.chip}`}>
                  {medal.label} — {group[0].points} نقطة
                </span>
              </div>

              {/* الطلاب في هذه المرتبة */}
              <div className="flex flex-wrap items-end justify-center gap-4 sm:gap-6">
                {group.map((student) => (
                  <div key={student.id} className="flex flex-col items-center">
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
    </div>
  );
}
