/**
 * نظام الحالة الذكية للطالب
 *
 * الحلقة:
 * 12:30 → 17:00
 *
 * الجمعة: عطلة.
 *
 * قبل 12:30:
 * لا نبدأ تقييمًا جديدًا، ونبقي تقييم اليوم السابق ثابتًا.
 *
 * أثناء الحلقة:
 * التقييم يعتمد على نقاط اليوم والوقت المنقضي فقط.
 *
 * بعد 17:00:
 * يثبت تقييم نهاية اليوم.
 */

export type StudentStatus = {
  emoji: string;
  label: string;
};

const LESSON_START_HOUR = 12;
const LESSON_START_MINUTE = 30;

const LESSON_END_HOUR = 17;
const LESSON_END_MINUTE = 0;

function getTurkeyNow(): Date {
  const now = new Date();

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type: string) =>
    parts.find((part) => part.type === type)?.value ?? "0";

  return new Date(
    Number(get("year")),
    Number(get("month")) - 1,
    Number(get("day")),
    Number(get("hour")),
    Number(get("minute")),
    Number(get("second"))
  );
}

export function isFriday(): boolean {
  return getTurkeyNow().getDay() === 5;
}

function getCurrentMinutes(): number {
  const now = getTurkeyNow();
  return now.getHours() * 60 + now.getMinutes();
}

const START_MINUTES = LESSON_START_HOUR * 60 + LESSON_START_MINUTE;
const END_MINUTES = LESSON_END_HOUR * 60 + LESSON_END_MINUTE;

export function isBeforeLesson(): boolean {
  if (isFriday()) return false;

  return getCurrentMinutes() < START_MINUTES;
}

export function isLessonInProgress(): boolean {
  if (isFriday()) return false;

  const minutes = getCurrentMinutes();

  return minutes >= START_MINUTES && minutes < END_MINUTES;
}

export function isLessonFinished(): boolean {
  if (isFriday()) return false;

  return getCurrentMinutes() >= END_MINUTES;
}

export function isHoliday(): boolean {
  return isFriday();
}

export function getHalqaDate(): string {
  const now = getTurkeyNow();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * نقاط الطالب لليوم الحالي فقط.
 */
export function getDailyPoints(student: {
  daily_points: number;
  daily_points_date: string | null;
}): number {
  if (isFriday()) return 0;

  if (!student.daily_points_date) return 0;

  if (student.daily_points_date !== getHalqaDate()) {
    return 0;
  }

  return Math.max(0, student.daily_points);
}

/**
 * كم ساعة تقريبًا مضت من بداية الحلقة؟
 *
 * نستخدمها حتى لا نحكم على الطالب في أول دقائق الحلقة.
 */
function getElapsedLessonHours(): number {
  if (!isLessonInProgress()) return 0;

  const now = getTurkeyNow();

  const start =
    LESSON_START_HOUR * 60 +
    LESSON_START_MINUTE;

  const current =
    now.getHours() * 60 +
    now.getMinutes();

  return Math.max(0, (current - start) / 60);
}

/**
 * الحد الأدنى المتوقع تقريبًا حسب الوقت.
 *
 * لا نستخدمه كعقوبة، وإنما حتى لا نقول للطالب
 * "أداؤك ضعيف" بعد دقائق قليلة من بداية الحلقة.
 */
function getExpectedPoints(): number {
  const hours = getElapsedLessonHours();

  if (hours < 1) return 0;
  if (hours < 2) return 2;
  if (hours < 3) return 4;
  if (hours < 4) return 6;

  return 0;
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
  // الجمعة
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (isFriday()) {
    return {
      emoji: "🌙",
      label: "عطلة — نلتقي غدًا بإذن الله",
    };
  }

  const today = getDailyPoints(student);

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // قبل بداية الحلقة
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  //
  // مهم:
  // لا نعيد الطالب إلى "صفر".
  // نعرض حالة محايدة لأن تقييم اليوم لم يبدأ.
  //
  if (isBeforeLesson()) {
    return {
      emoji: "🌙",
      label: "تبدأ الحلقة 12:30",
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أثناء الحلقة
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (isLessonInProgress()) {
    const elapsedHours = getElapsedLessonHours();
    const expected = getExpectedPoints();

    // أول ساعة: لا نحكم عليه.
    if (elapsedHours < 1) {
      if (today >= 3) {
        return {
          emoji: "🌟",
          label: "بداية قوية",
        };
      }

      if (today >= 1) {
        return {
          emoji: "🌱",
          label: "بداية طيبة",
        };
      }

      return {
        emoji: "⏳",
        label: "التقييم جارٍ",
      };
    }

    // بعد أول ساعة نبدأ التقييم التدريجي.

    if (today >= expected + 3) {
      return {
        emoji: "🚀",
        label: "تقدم رائع",
      };
    }

    if (today >= expected) {
      return {
        emoji: "🌟",
        label: "أداء جيد",
      };
    }

    if (today >= expected - 1) {
      return {
        emoji: "🌱",
        label: "يسير بشكل جيد",
      };
    }

    return {
      emoji: "💪",
      label: "يحتاج إلى مزيد من الجهد",
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // بعد انتهاء الحلقة
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  if (today === 0) {
    return {
      emoji: "⚠️",
      label: "يحتاج إلى مزيد من الجهد",
    };
  }

  if (today >= 10) {
    return {
      emoji: "🏆",
      label: "أداء استثنائي",
    };
  }

  if (today >= 7) {
    return {
      emoji: "🌟",
      label: "أداء متميز",
    };
  }

  if (today >= 5) {
    return {
      emoji: "⭐",
      label: "أداء ممتاز",
    };
  }

  if (today >= 3) {
    return {
      emoji: "👍",
      label: "أداء جيد",
    };
  }

  if (today === 2) {
    return {
      emoji: "🙂",
      label: "أداء مقبول",
    };
  }

  return {
    emoji: "🌱",
    label: "بداية طيبة",
  };
}
