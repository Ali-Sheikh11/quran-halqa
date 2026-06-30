import type { Student } from "@/types/database.types";
import StudentAvatar from "./StudentAvatar";

const MEDALS = [
  { icon: "🥇", ring: "border-gold ring-4 ring-gold/30", chip: "bg-gold text-night", label: "الأول" },
  { icon: "🥈", ring: "border-slate-300 ring-4 ring-slate-200/60", chip: "bg-slate-300 text-night", label: "الثاني" },
  { icon: "🥉", ring: "border-amber-700/70 ring-4 ring-amber-700/20", chip: "bg-amber-700/80 text-sand", label: "الثالث" },
] as const;

/**
 * قاعة الشرف: أفضل 3 طلاب حسب النقاط، بإبراز بصري ذهبي/فضي/برونزي.
 */
export default function HallOfFame({ students }: { students: Student[] }) {
  const top3 = [...students]
    .sort((a, b) => b.points - a.points)
    .slice(0, 3)
    .filter((s) => s.points > 0 || students.length <= 3);

  if (top3.length === 0) return null;

  // ترتيب العرض بصريًا: الثاني - الأول - الثالث (تمنّصة في المنتصف)
  const order = top3.length === 3 ? [1, 0, 2] : top3.map((_, i) => i);

  return (
    <div className="corner-ornament relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-b from-emerald-50 to-white px-5 py-7 shadow-sm">
      <h2 className="mb-6 text-center font-verse text-lg font-bold text-emerald-800 sm:text-xl">
        🏅 قاعة الشرف
      </h2>
      <div className="flex flex-wrap items-end justify-center gap-5 sm:gap-8">
        {order.map((idx) => {
          const student = top3[idx];
          if (!student) return null;
          const medal = MEDALS[idx];
          const isFirst = idx === 0;
          return (
            <div
              key={student.id}
              className={`flex flex-col items-center ${isFirst ? "order-2 -translate-y-2" : idx === 1 ? "order-1" : "order-3"}`}
            >
              <span className="mb-2 text-2xl sm:text-3xl" aria-hidden="true">
                {medal.icon}
              </span>
              <StudentAvatar
                name={student.full_name}
                photoUrl={student.photo_url}
                size={isFirst ? "lg" : "md"}
              />
              <p className="mt-2 max-w-[7.5rem] truncate text-sm font-bold text-emerald-800">
                {student.full_name}
              </p>
              <span
                className={`mt-1 rounded-full px-3 py-0.5 text-xs font-bold ${medal.chip}`}
              >
                {student.points} نقطة
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
