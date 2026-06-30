/**
 * شريط تقدّم نحو المحطة التالية (50 → 100 → 150 ...).
 * النجمة تتحرك بسلاسة فوق الشريط مع الـ animation، والنسبة تُحسب
 * دائمًا بالنسبة للمحطة القادمة فقط (مثال: 53/100، 121/150).
 */
export default function ProgressBar({
  points,
  size = "md",
}: {
  points: number;
  size?: "sm" | "md";
}) {
  const safePoints = Math.max(0, points);
  const nextMilestone = (Math.floor(safePoints / 50) + 1) * 50;
  const percent = Math.min(100, Math.max(0, (safePoints / nextMilestone) * 100));

  const trackHeight = size === "sm" ? "h-2" : "h-2.5";

  return (
    <div className="w-full" dir="ltr">
      <div
        className={`relative w-full overflow-visible rounded-full bg-emerald-100 ${trackHeight}`}
        role="progressbar"
        aria-valuenow={safePoints}
        aria-valuemin={0}
        aria-valuemax={nextMilestone}
        aria-label={`التقدم: ${safePoints} من ${nextMilestone}`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-l from-gold via-gold-light to-gold transition-all duration-700 ease-out"
          style={{ width: `${percent}%` }}
        />
        <span
          className="absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
          style={{ left: `calc(${percent}% - 8px)` }}
          aria-hidden="true"
        >
          <span className="block text-[13px] leading-none drop-shadow-sm">⭐</span>
        </span>
      </div>
      <div dir="rtl" className="mt-1.5 flex items-center justify-between text-[11px] font-semibold text-night/45">
        <span>
          {safePoints}/{nextMilestone}
        </span>
        <span className="text-gold-deep">نحو المحطة القادمة</span>
      </div>
    </div>
  );
}
