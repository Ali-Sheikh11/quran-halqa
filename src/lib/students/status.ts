/**
 * نظام الحالة اليومية للطالب — يُعرض للزوار بدل النقاط الإجمالية.
 * يعتمد فقط على نقاط اليوم الحالي، ويتجدد تلقائياً مع بداية كل يوم.
 */

export type StudentStatus = {
  emoji: string;
  label: string;
};

/**
 * سلّم الحالات من الأعلى إلى الأقل.
 * الحد الأدنى لكل حالة = عدد النقاط اليومية المطلوبة.
 */
const STATUS_LEVELS: Array<{ minPoints: number } & StudentStatus> = [
  { minPoints: 16, emoji: "👑", label: "استثنائي" },
  { minPoints: 13, emoji: "🏆", label: "متميز جداً" },
  { minPoints: 11, emoji: "🌟", label: "متميز" },
  { minPoints: 9,  emoji: "✨", label: "ممتاز" },
  { minPoints: 7,  emoji: "⭐", label: "متألق" },
  { minPoints: 6,  emoji: "🔥", label: "رائع" },
  { minPoints: 5,  emoji: "🚀", label: "متقدم" },
  { minPoints: 4,  emoji: "📈", label: "جيد جداً" },
  { minPoints: 3,  emoji: "💪", label: "مجتهد" },
  { minPoints: 2,  emoji: "👏", label: "جيد" },
  { minPoints: 1,  emoji: "🙂", label: "مستقر" },
  { minPoints: 0,  emoji: "🌱", label: "بداية جديدة" },
  { minPoints: -1, emoji: "🌿", label: "في تحسن" },
  { minPoints: -3, emoji: "🎯", label: "قادر على الأفضل" },
  { minPoints: -Infinity, emoji: "🔄", label: "يحتاج إلى مزيد من الاجتهاد" },
];

/**
 * يحسب نقاط الطالب لليوم الحالي.
 * إذا كان تاريخ آخر تحديث ليس اليوم → نقاط اليوم = 0 (يوم جديد).
 */
export function getDailyPoints(student: {
  daily_points: number;
  daily_points_date: string | null;
}): number {
  if (!student.daily_points_date) return 0;

  const today = new Date().toISOString().split("T")[0];
  if (student.daily_points_date !== today) return 0;

  return student.daily_points;
}

/**
 * يُرجع الحالة المناسبة للطالب بناءً على نقاط اليوم.
 */
export function getStudentStatus(student: {
  daily_points: number;
  daily_points_date: string | null;
}): StudentStatus {
  const points = getDailyPoints(student);
  return (
    STATUS_LEVELS.find((level) => points >= level.minPoints) ??
    STATUS_LEVELS[STATUS_LEVELS.length - 1]
  );
}
