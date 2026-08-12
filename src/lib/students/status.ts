/**
 * نظام الحالة الذكية للطالب
 *
 * الحلقة: 12:30 → 17:00
 * الجمعة: عطلة
 *
 * قبل 12:30  → حالة آخر يوم (ثابتة)
 * أثناء الحلقة → تقييم حي يتجدد كل ساعة
 * بعد 17:00  → حالة اليوم ثابتة حتى الغد
 */

export type StudentStatus = {
  emoji: string;
  label: string;
};

const LESSON_START_HOUR = 12;
const LESSON_START_MINUTE = 30;
const LESSON_END_HOUR = 17;
const LESSON_END_MINUTE = 0;

const START_MINUTES =
  LESSON_START_HOUR * 60 + LESSON_START_MINUTE;
const END_MINUTES =
  LESSON_END_HOUR * 60 + LESSON_END_MINUTE;

function getTurkeyNow(): Date {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "0";

  return new Date(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")),
    Number(get("minute")),
    Number(get("second"))
  );
}

export function getHalqaDate(): string {
  const now = getTurkeyNow();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getCurrentMinutes(): number {
  const now = getTurkeyNow();
  return now.getHours() * 60 + now.getMinutes();
}

export function isFriday(): boolean {
  return getTurkeyNow().getDay() === 5;
}

export function isBeforeLesson(): boolean {
  if (isFriday()) return false;
  return getCurrentMinutes() < START_MINUTES;
}

export function isLessonInProgress(): boolean {
  if (isFriday()) return false;
  const m = getCurrentMinutes();
  return m >= START_MINUTES && m < END_MINUTES;
}

export function isLessonFinished(): boolean {
  if (isFriday()) return false;
  return getCurrentMinutes() >= END_MINUTES;
}

export function isHoliday(): boolean {
  return isFriday();
}

/** نقاط الطالب لليوم الحالي فقط */
export function getDailyPoints(student: {
  daily_points: number;
  daily_points_date: string | null;
}): number {
  if (isFriday()) return 0;
  if (!student.daily_points_date) return 0;
  if (student.daily_points_date !== getHalqaDate()) return 0;
  return Math.max(0, student.daily_points);
}

/** كم ساعة مضت من بداية الحلقة */
function getElapsedLessonHours(): number {
  if (!isLessonInProgress()) return 0;
  const now = getTurkeyNow();
  const current = now.getHours() * 60 + now.getMinutes();
  return Math.max(0, (current - START_MINUTES) / 60);
}

/** النقاط المتوقعة حسب الوقت المنقضي */
function getExpectedPoints(): number {
  const hours = getElapsedLessonHours();
  if (hours < 1) return 0;
  if (hours < 2) return 2;
  if (hours < 3) return 4;
  if (hours < 4) return 6;
  return 0;
}

/** حالة اليوم السابق — تُعرض قبل بداية الحلقة وبعدها */
function getLastDayStatus(student: {
  daily_points: number;
  daily_points_date: string | null;
}): StudentStatus {
  // هل يوجد تقييم محفوظ من اليوم نفسه أو يوم سابق؟
  const savedPoints = Math.max(0, student.daily_points ?? 0);
  const hasData = !!student.daily_points_date;

  if (!hasData || savedPoints === 0) {
    return { emoji: "🌱", label: "في انتظار التقييم" };
  }

  if (savedPoints >= 10) return { emoji: "🏆", label: "أداء استثنائي" };
  if (savedPoints >= 7)  return { emoji: "🌟", label: "أداء متميز" };
  if (savedPoints >= 5)  return { emoji: "⭐", label: "أداء ممتاز" };
  if (savedPoints >= 3)  return { emoji: "👍", label: "أداء جيد" };
  if (savedPoints >= 2)  return { emoji: "🙂", label: "أداء مقبول" };
  return                        { emoji: "🌱", label: "بداية طيبة" };
}

export function getStudentStatus(
  student: {
    daily_points: number;
    daily_points_date: string | null;
  },
  allStudents?: Array<{
    daily_points: number;
    daily_points_date: string | null;
  }>
): StudentStatus {

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // الجمعة — عطلة
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isFriday()) {
    return { emoji: "🌙", label: "عطلة — نلتقي غدًا بإذن الله" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // قبل بداية الحلقة → حالة آخر يوم
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isBeforeLesson()) {
    const last = getLastDayStatus(student);
    return {
      emoji: last.emoji,
      label: `${last.label} • تبدأ 12:30`,
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // بعد نهاية الحلقة → حالة اليوم ثابتة
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isLessonFinished()) {
    const today = getDailyPoints(student);

    if (today === 0) {
      return { emoji: "⚠️", label: "يحتاج إلى مزيد من الجهد" };
    }
    if (today >= 10) return { emoji: "🏆", label: "أداء استثنائي" };
    if (today >= 7)  return { emoji: "🌟", label: "أداء متميز" };
    if (today >= 5)  return { emoji: "⭐", label: "أداء ممتاز" };
    if (today >= 3)  return { emoji: "👍", label: "أداء جيد" };
    if (today >= 2)  return { emoji: "🙂", label: "أداء مقبول" };
    return                  { emoji: "🌱", label: "بداية طيبة" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أثناء الحلقة → تقييم حي
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const today = getDailyPoints(student);
  const elapsedHours = getElapsedLessonHours();
  const expected = getExpectedPoints();

  // أول ساعة — لا نحكم عليه
  if (elapsedHours < 1) {
    if (today >= 3) return { emoji: "🌟", label: "بداية قوية" };
    if (today >= 1) return { emoji: "🌱", label: "بداية طيبة" };
    return                 { emoji: "⏳", label: "التقييم جارٍ" };
  }

  // بعد أول ساعة — تقييم تدريجي
  if (today >= expected + 4) return { emoji: "🏆", label: "أداء استثنائي" };
  if (today >= expected + 3) return { emoji: "🚀", label: "تقدم رائع" };
  if (today >= expected + 2) return { emoji: "🌟", label: "أداء متميز" };
  if (today >= expected + 1) return { emoji: "⭐", label: "أداء جيد جداً" };
  if (today >= expected)     return { emoji: "👍", label: "أداء جيد" };
  if (today >= expected - 1) return { emoji: "🌱", label: "يسير بشكل جيد" };
  return                            { emoji: "💪", label: "يحتاج إلى مزيد من الجهد" };
      }
