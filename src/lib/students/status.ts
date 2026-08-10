/**
 * نظام الحالة الذكية للطالب:
 * يعتمد على نقاط اليوم + المقارنة مع أمس + موقعه بين زملائه.
 * الهدف: تقييم واقعي لأداء الطالب مع تشجيعه على التحسن،
 * دون مبالغة في المدح أو إحباطه عند التراجع.
 */

export type StudentStatus = {
  emoji: string;
  label: string;
};

/** يحسب نقاط الطالب لليوم الحالي فقط */
export function getDailyPoints(student: {
  daily_points: number;
  daily_points_date: string | null;
}): number {
  if (!student.daily_points_date) return 0;

  const today = new Date().toISOString().split("T")[0];

  if (student.daily_points_date !== today) return 0;

  return student.daily_points;
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
  const today = getDailyPoints(student);
  const yesterday = student.yesterday_points ?? 0;
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
  // نقاط سالبة
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today < 0) {
    // تحسن واضح مقارنة بأمس، رغم بقاء النتيجة سالبة
    if (diff >= 4) {
      return { emoji: "📈", label: "تحسن واضح، لكن ما زال يحتاج إلى تحسين" };
    }

    if (diff >= 2) {
      return { emoji: "🌿", label: "في تحسن، لكن يحتاج إلى مزيد من الاهتمام" };
    }

    // تراجع بسيط
    if (today >= -2) {
      return { emoji: "⚠️", label: "يحتاج إلى الانتباه" };
    }

    // أداء غير مرضٍ
    if (today >= -4) {
      return { emoji: "🟠", label: "أداؤه اليوم غير مرضٍ" };
    }

    // تراجع كبير أو نقاط سالبة كثيرة
    return { emoji: "🔴", label: "يحتاج إلى اهتمام جاد" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // صفر نقاط
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today === 0) {
    if (yesterday >= 7) {
      return { emoji: "📉", label: "تراجع واضح عن أداء الأمس" };
    }

    if (yesterday >= 4) {
      return { emoji: "⚠️", label: "أداؤه اليوم يحتاج إلى تحسين" };
    }

    if (yesterday >= 1) {
      return { emoji: "😐", label: "أداء منخفض اليوم" };
    }

    return { emoji: "🌱", label: "لم يبدأ التقييم اليوم" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // نجم اليوم: الأعلى بين الجميع مع أداء مرتفع
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isTopStudent && today >= 7) {
    return { emoji: "👑", label: "نجم اليوم" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أداء استثنائي: 10 نقاط أو أكثر
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today >= 10) {
    if (diff >= 4) {
      return { emoji: "🚀", label: "أداء استثنائي وتحسن كبير" };
    }

    if (diff >= 0) {
      return { emoji: "🏆", label: "أداء استثنائي" };
    }

    if (diff >= -3) {
      return { emoji: "🌟", label: "أداء ممتاز رغم التراجع" };
    }

    return { emoji: "📉", label: "أداء قوي، لكن هناك تراجع ملحوظ" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أداء متميز: 7–9 نقاط
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today >= 7) {
    if (diff >= 4) {
      return { emoji: "📈", label: "تحسن كبير" };
    }

    if (diff >= 2) {
      return { emoji: "🌟", label: "تقدم رائع" };
    }

    if (diff >= 0) {
      return { emoji: "🏆", label: "أداء متميز" };
    }

    if (diff >= -2) {
      return { emoji: "⭐", label: "أداء ممتاز مع تراجع بسيط" };
    }

    return { emoji: "📉", label: "أداء جيد، لكن هناك تراجع واضح" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أداء ممتاز: 5–6 نقاط
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today >= 5) {
    if (diff >= 4) {
      return { emoji: "📈", label: "تحسن كبير" };
    }

    if (diff >= 2) {
      return { emoji: "🚀", label: "تقدم واضح" };
    }

    if (diff === 1) {
      return { emoji: "🌟", label: "أداء ممتاز" };
    }

    if (diff === 0) {
      if (aboveAvg) {
        return { emoji: "🏆", label: "أداء ممتاز ومستقر" };
      }

      return { emoji: "🌟", label: "أداء ممتاز" };
    }

    if (diff >= -2) {
      return { emoji: "⭐", label: "أداء جيد جدًا مع تراجع بسيط" };
    }

    return { emoji: "📉", label: "أداء جيد، لكن هناك تراجع ملحوظ" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أداء جيد جدًا: 3–4 نقاط
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today >= 3) {
    if (diff >= 3) {
      return { emoji: "📈", label: "تحسن ملحوظ" };
    }

    if (diff >= 2) {
      return { emoji: "🚀", label: "في تقدم واضح" };
    }

    if (diff === 1) {
      return { emoji: "💪", label: "أداء جيد جدًا وفي تحسن" };
    }

    if (diff === 0) {
      if (aboveAvg) {
        return { emoji: "⭐", label: "أداء جيد جدًا ومستقر" };
      }

      return { emoji: "👍", label: "أداء جيد ومستقر" };
    }

    if (diff === -1) {
      return { emoji: "🌿", label: "أداء جيد، لكن هناك تراجع بسيط" };
    }

    if (diff === -2) {
      return { emoji: "⚠️", label: "أداء مقبول، لكنه يحتاج إلى تحسين" };
    }

    return { emoji: "📉", label: "تراجع ملحوظ عن الأمس" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // نقطتان
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today === 2) {
    if (diff >= 3) {
      return { emoji: "📈", label: "تحسن ملحوظ" };
    }

    if (diff >= 1) {
      return { emoji: "🌿", label: "في تحسن" };
    }

    if (diff === 0) {
      return { emoji: "🙂", label: "أداء مقبول ومستقر" };
    }

    if (diff === -1) {
      return { emoji: "⚠️", label: "يحتاج إلى تحسين" };
    }

    return { emoji: "📉", label: "تراجع واضح عن الأمس" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // نقطة واحدة
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today === 1) {
    if (yesterday <= 0) {
      return { emoji: "🌱", label: "بداية طيبة" };
    }

    if (diff === 0) {
      return { emoji: "😐", label: "أداء منخفض ومستقر" };
    }

    if (diff >= -2) {
      return { emoji: "⚠️", label: "أداؤه اليوم يحتاج إلى تحسين" };
    }

    return { emoji: "📉", label: "تراجع واضح عن الأمس" };
  }

  return { emoji: "🌱", label: "لم يبدأ التقييم اليوم" };
}
