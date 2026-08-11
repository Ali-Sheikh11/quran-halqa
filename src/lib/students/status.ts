/**
 * نظام الحالة الذكية للطالب.
 *
 * أوقات الحلقة:
 * 12:30 ظهرًا → 17:00 مساءً
 *
 * الجمعة: عطلة كاملة.
 *
 * قبل بداية الحلقة:
 * لا يتم الحكم على الطالب.
 *
 * أثناء الحلقة:
 * التقييم جارٍ، ولا تتم مقارنة الطالب بالأمس.
 *
 * بعد انتهاء الحلقة:
 * يبدأ التقييم والمقارنة مع آخر يوم حلقة سابق.
 */

export type StudentStatus = {
  emoji: string;
  label: string;
};

const LESSON_START_HOUR = 12;
const LESSON_START_MINUTE = 30;

const LESSON_END_HOUR = 17;
const LESSON_END_MINUTE = 0;

/**
 * الحصول على الوقت الحالي بتوقيت تركيا.
 */
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

/**
 * هل اليوم جمعة؟
 *
 * JavaScript:
 * 0 = الأحد
 * 1 = الإثنين
 * ...
 * 5 = الجمعة
 * 6 = السبت
 */
export function isFriday(): boolean {
  return getTurkeyNow().getDay() === 5;
}

/**
 * تاريخ يوم الحلقة الحالي.
 *
 * قبل 12:30 نعتبر أننا ما زلنا في يوم الحلقة السابق.
 *
 * الجمعة تبقى جمعة ولا يتم تحويلها إلى الخميس،
 * لأن الجمعة عطلة مستقلة.
 */
export function getHalqaDate(): string {
  const now = getTurkeyNow();

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const startMinutes = LESSON_START_HOUR * 60 + LESSON_START_MINUTE;

  const date = new Date(now);

  if (minutesNow < startMinutes && date.getDay() !== 5) {
    date.setDate(date.getDate() - 1);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/**
 * هل نحن داخل فترة الحلقة؟
 *
 * 12:30 → 17:00
 *
 * الجمعة دائمًا عطلة.
 */
export function isLessonInProgress(): boolean {
  if (isFriday()) return false;

  const now = getTurkeyNow();

  const minutesNow = now.getHours() * 60 + now.getMinutes();

  const startMinutes = LESSON_START_HOUR * 60 + LESSON_START_MINUTE;
  const endMinutes = LESSON_END_HOUR * 60 + LESSON_END_MINUTE;

  return minutesNow >= startMinutes && minutesNow < endMinutes;
}

/**
 * هل انتهت الحلقة؟
 *
 * الجمعة لا تعتبر يوم حلقة من الأساس.
 */
export function isLessonFinished(): boolean {
  if (isFriday()) return false;

  const now = getTurkeyNow();

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const endMinutes = LESSON_END_HOUR * 60 + LESSON_END_MINUTE;

  return minutesNow >= endMinutes;
}

/**
 * هل لم تبدأ الحلقة بعد؟
 *
 * الجمعة لا تعتبر "قبل الحلقة"، بل عطلة.
 */
export function isBeforeLesson(): boolean {
  if (isFriday()) return false;

  const now = getTurkeyNow();

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const startMinutes = LESSON_START_HOUR * 60 + LESSON_START_MINUTE;

  return minutesNow < startMinutes;
}

/**
 * هل يمكن تقييم الطالب الآن؟
 *
 * لا يمكن التقييم:
 * - يوم الجمعة
 * - قبل 17:00
 */
export function canEvaluateStudent(): boolean {
  return isLessonFinished();
}

/**
 * هل اليوم عطلة؟
 */
export function isHoliday(): boolean {
  return isFriday();
}

/**
 * يحسب نقاط الطالب ليوم الحلقة الحالي فقط.
 */
export function getDailyPoints(student: {
  daily_points: number;
  daily_points_date: string | null;
}): number {
  if (!student.daily_points_date) return 0;

  // الجمعة عطلة ولا توجد نقاط لليوم.
  if (isFriday()) return 0;

  const halqaDate = getHalqaDate();

  if (student.daily_points_date !== halqaDate) {
    return 0;
  }

  return Math.max(0, student.daily_points);
}

export function getStudentStatus(
  student: {
    daily_points: number;
    daily_points_date: string | null;
    yesterday_points: number;
  },
  allStudents?: Array<{
    daily_points: number;
    daily_points_date: string | null;
  }>
): StudentStatus {
  /*
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * الجمعة — عطلة
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *
   * مهم:
   * لا نقارن الجمعة بالخميس.
   * لا نعتبر الطالب متأخرًا.
   * لا نعتبره صاحب صفر نقاط.
   */
  if (isFriday()) {
    return {
      emoji: "🌙",
      label: "عطلة — نلتقي غدًا بإذن الله",
    };
  }

  const today = getDailyPoints(student);

  /*
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * قبل بداية الحلقة
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   */
  if (isBeforeLesson()) {
    return {
      emoji: "🌙",
      label: "لم يبدأ التقييم اليوم",
    };
  }

  /*
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   * أثناء الحلقة
   * ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   *
   * لا تتم المقارنة بالأمس.
   *
   * مثال:
   * 12:31 → الطالب لديه 0 نقاط
   *
   * هذا طبيعي تمامًا.
   */
  if (isLessonInProgress()) {
    return {
      emoji: "⏳",
      label: "التقييم جارٍ",
    };
  }

  /*
   * من هنا انتهت الحلقة.
   */
  const yesterday = Math.max(0, student.yesterday_points ?? 0);
  const diff = today - yesterday;

  // متوسط نقاط اليوم بين الطلاب
  let avgToday = 0;

  if (allStudents && allStudents.length > 0) {
    const totalToday = allStudents.reduce(
      (sum, s) => sum + getDailyPoints(s),
      0
    );

    avgToday = totalToday / allStudents.length;
  }

  const aboveAvg = today > avgToday && avgToday > 0;

  const isTopStudent =
    allStudents &&
    allStudents.length > 0 &&
    today > 0 &&
    today === Math.max(...allStudents.map((s) => getDailyPoints(s)));

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // صفر نقاط بعد انتهاء الحلقة
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today === 0) {
    if (yesterday >= 7) {
      return {
        emoji: "📉",
        label: "تراجع واضح عن أداء الأمس",
      };
    }

    if (yesterday >= 4) {
      return {
        emoji: "⚠️",
        label: "أداؤه اليوم يحتاج إلى تحسين",
      };
    }

    if (yesterday >= 1) {
      return {
        emoji: "😐",
        label: "أداء منخفض اليوم",
      };
    }

    return {
      emoji: "⚠️",
      label: "يحتاج إلى مزيد من الجهد",
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // نجم اليوم
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isTopStudent && today >= 7) {
    return {
      emoji: "👑",
      label: "نجم اليوم",
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أداء استثنائي: 10+
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today >= 10) {
    if (diff >= 4) {
      return {
        emoji: "🚀",
        label: "أداء استثنائي وتحسن كبير",
      };
    }

    if (diff >= 0) {
      return {
        emoji: "🏆",
        label: "أداء استثنائي",
      };
    }

    if (diff >= -3) {
      return {
        emoji: "🌟",
        label: "أداء ممتاز رغم التراجع",
      };
    }

    return {
      emoji: "📉",
      label: "أداء قوي، لكن هناك تراجع ملحوظ",
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أداء متميز: 7–9
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today >= 7) {
    if (diff >= 4) {
      return {
        emoji: "📈",
        label: "تحسن كبير",
      };
    }

    if (diff >= 2) {
      return {
        emoji: "🌟",
        label: "تقدم رائع",
      };
    }

    if (diff >= 0) {
      return {
        emoji: "🏆",
        label: "أداء متميز",
      };
    }

    if (diff >= -2) {
      return {
        emoji: "⭐",
        label: "أداء ممتاز مع تراجع بسيط",
      };
    }

    return {
      emoji: "📉",
      label: "أداء جيد، لكن هناك تراجع واضح",
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أداء ممتاز: 5–6
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today >= 5) {
    if (diff >= 4) {
      return {
        emoji: "📈",
        label: "تحسن كبير",
      };
    }

    if (diff >= 2) {
      return {
        emoji: "🚀",
        label: "تقدم واضح",
      };
    }

    if (diff === 1) {
      return {
        emoji: "🌟",
        label: "أداء ممتاز",
      };
    }

    if (diff === 0) {
      if (aboveAvg) {
        return {
          emoji: "🏆",
          label: "أداء ممتاز ومستقر",
        };
      }

      return {
        emoji: "🌟",
        label: "أداء ممتاز",
      };
    }

    if (diff >= -2) {
      return {
        emoji: "⭐",
        label: "أداء جيد جدًا مع تراجع بسيط",
      };
    }

    return {
      emoji: "📉",
      label: "أداء جيد، لكن هناك تراجع ملحوظ",
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أداء جيد جدًا: 3–4
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today >= 3) {
    if (diff >= 3) {
      return {
        emoji: "📈",
        label: "تحسن ملحوظ",
      };
    }

    if (diff >= 2) {
      return {
        emoji: "🚀",
        label: "في تقدم واضح",
      };
    }

    if (diff === 1) {
      return {
        emoji: "💪",
        label: "أداء جيد جدًا وفي تحسن",
      };
    }

    if (diff === 0) {
      if (aboveAvg) {
        return {
          emoji: "⭐",
          label: "أداء جيد جدًا ومستقر",
        };
      }

      return {
        emoji: "👍",
        label: "أداء جيد ومستقر",
      };
    }

    if (diff === -1) {
      return {
        emoji: "🌿",
        label: "أداء جيد، لكن هناك تراجع بسيط",
      };
    }

    if (diff === -2) {
      return {
        emoji: "⚠️",
        label: "أداء مقبول، لكنه يحتاج إلى تحسين",
      };
    }

    return {
      emoji: "📉",
      label: "تراجع ملحوظ عن الأمس",
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // نقطتان
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today === 2) {
    if (diff >= 3) {
      return {
        emoji: "📈",
        label: "تحسن ملحوظ",
      };
    }

    if (diff >= 1) {
      return {
        emoji: "🌿",
        label: "في تحسن",
      };
    }

    if (diff === 0) {
      return {
        emoji: "🙂",
        label: "أداء مقبول ومستقر",
      };
    }

    if (diff === -1) {
      return {
        emoji: "⚠️",
        label: "يحتاج إلى تحسين",
      };
    }

    return {
      emoji: "📉",
      label: "تراجع واضح عن الأمس",
    };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // نقطة واحدة
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today === 1) {
    if (yesterday <= 0) {
      return {
        emoji: "🌱",
        label: "بداية طيبة",
      };
    }

    if (diff === 0) {
      return {
        emoji: "😐",
        label: "أداء منخفض ومستقر",
      };
    }

    if (diff >= -2) {
      return {
        emoji: "⚠️",
        label: "أداؤه اليوم يحتاج إلى تحسين",
      };
    }

    return {
      emoji: "📉",
      label: "تراجع واضح عن الأمس",
    };
  }

  return {
    emoji: "🌱",
    label: "لم يبدأ التقييم اليوم",
  };
      }
