import type { Student } from "@/types/database.types";
import StudentAvatar from "./StudentAvatar";
import IslamicPattern from "@/components/IslamicPattern";

const MEDALS = ["🥇", "🥈", "🥉"] as const;
const MEDAL_STYLES = [
  "border-gold ring-4 ring-gold/30 bg-gradient-to-b from-gold-light/20 to-white",
  "border-slate-300 ring-4 ring-slate-200/60 bg-gradient-to-b from-slate-50 to-white",
  "border-amber-700/70 ring-4 ring-amber-700/20 bg-gradient-to-b from-amber-50 to-white",
] as const;

export default function SessionEndedScreen({
  students,
  sessionName,
  isAdmin,
}: {
  students: Student[];
  sessionName: string;
  isAdmin: boolean;
}) {
  // ترتيب حسب النقاط مع دعم التعادل
  const sorted = [...students].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return a.created_at.localeCompare(b.created_at);
  });

  // تجميع المتعادلين
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
    <div className="relative min-h-[calc(100vh-64px)] overflow-hidden bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-600">
      <IslamicPattern />

      <div className="relative mx-auto max-w-4xl px-5 py-12">

        {/* رسالة الاختتام */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-medium tracking-wide text-gold-light">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h1 className="font-verse text-3xl font-bold text-sand sm:text-4xl">
            🏆 اختتام {sessionName}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-sand/85">
            بفضل الله وتوفيقه، اختتمنا دورتنا المباركة بنجاح.
            نهنئ جميع الطلاب على جهودهم وإخلاصهم في حفظ كتاب الله.
          </p>
          <p className="mt-3 font-verse text-lg text-gold-light">
            ﴿ وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ ﴾
          </p>
        </div>

        {/* قاعة الشرف النهائية */}
        {topGroups.length > 0 && (
          <div className="mb-10 rounded-2xl border border-gold/30 bg-white/95 p-6 shadow-ornate backdrop-blur-sm">
            <h2 className="mb-6 text-center font-verse text-xl font-bold text-emerald-800">
              🏅 قاعة الشرف النهائية
            </h2>

            <div className="flex flex-col gap-6">
              {topGroups.map((group, groupIndex) => (
                <div key={groupIndex}>
                  <div className="mb-3 flex items-center justify-center gap-2">
                    <span className="text-2xl">{MEDALS[groupIndex]}</span>
                    <span className="rounded-full border border-gold/40 bg-gold-light/30 px-3 py-0.5 text-sm font-bold text-gold-deep">
                      {groupIndex === 0 ? "الأول" : groupIndex === 1 ? "الثاني" : "الثالث"}
                      {" — "}
                      {group[0].points} نقطة
                    </span>
                  </div>
                  <div className={`flex flex-wrap items-center justify-center gap-4 rounded-2xl border p-4 ${MEDAL_STYLES[groupIndex]}`}>
                    {group.map((student) => (
                      <div key={student.id} className="flex flex-col items-center">
                        <div className="relative">
                          <span className="absolute -top-2 right-1/2 translate-x-1/2 text-lg">
                            {MEDALS[groupIndex]}
                          </span>
                          <StudentAvatar
                            name={student.full_name}
                            photoUrl={student.photo_url}
                            size={groupIndex === 0 ? "lg" : "md"}
                          />
                        </div>
                        <p className="mt-2 max-w-[7rem] truncate text-sm font-bold text-emerald-800">
                          {student.full_name}
                        </p>
                        <span className="mt-1 text-xs font-semibold text-gold-deep">
                          {student.points} نقطة
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* قائمة جميع الطلاب */}
        {sorted.length > 0 && (
          <div className="rounded-2xl border border-gold/20 bg-white/95 p-5 shadow-sm backdrop-blur-sm">
            <h2 className="mb-4 font-verse text-lg font-bold text-emerald-800">
              📋 النتائج النهائية
            </h2>
            <div className="divide-y divide-emerald-50">
              {sorted.map((student, index) => {
                const rank = groups.findIndex((g) =>
                  g.some((s) => s.id === student.id)
                ) + 1;
                return (
                  <div key={student.id}
                    className="flex items-center gap-4 py-3">
                    <span className="w-6 shrink-0 text-center text-sm font-bold text-night/40">
                      {rank <= 3 ? MEDALS[rank - 1] : rank}
                    </span>
                    <StudentAvatar
                      name={student.full_name}
                      photoUrl={student.photo_url}
                      size="sm"
                    />
                    <span className="flex-1 text-sm font-bold text-emerald-800">
                      {student.full_name}
                    </span>
                    <span className="rounded-full border border-gold/40 bg-gold-light/30 px-3 py-0.5 text-xs font-bold text-gold-deep">
                      {student.points} نقطة
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* زر الأدمن للعودة للوحة التحكم */}
        {isAdmin && (
          <div className="mt-8 text-center">
            
              href="/admin/session"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-bold text-night transition hover:bg-gold-light"
            >
              🚀 بدء دورة جديدة من لوحة التحكم
            </a>
          </div>
        )}

        <p className="mt-8 text-center text-sm text-sand/60">
          جزى الله كل طالب خير الجزاء على اجتهاده وإخلاصه 🌱
        </p>
      </div>
    </div>
  );
}
