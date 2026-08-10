/**
 * نظام الحالة الذكية للطالب:
 * يعتمد على نقاط اليوم + المقارنة مع أمس + موقعه بين زملائه.
 * الهدف: تشجيع الطالب على التحسن الذاتي، لا المنافسة.
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

  // متوسط اليوم بين الطلاب
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
  // لم يحصل على أي نقطة اليوم
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today === 0) {
    if (yesterday >= 5) return { emoji: "💤", label: "نستنتظر عودتك اليوم" };
    if (yesterday >= 3) return { emoji: "🌅", label: "اليوم فرصة جديدة" };
    return { emoji: "🌱", label: "بداية جديدة" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // نجم اليوم (الأعلى بين الجميع)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (isTopStudent && today >= 5) {
    return { emoji: "👑", label: "نجم اليوم" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أداء استثنائي (10+ نقاط)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today >= 10) {
    if (diff >= 3)  return { emoji: "🚀", label: "قفزة استثنائية" };
    if (diff >= 0)  return { emoji: "🏆", label: "أداء استثنائي" };
    return              { emoji: "💎", label: "رائع رغم التراجع البسيط" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أداء ممتاز (7-9 نقاط)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today >= 7) {
    if (diff >= 4)  return { emoji: "📈", label: "تحسن مذهل" };
    if (diff >= 2)  return { emoji: "🌟", label: "تقدم رائع" };
    if (diff >= 0)  return { emoji: "🔥", label: "مستمر في التميز" };
    if (diff >= -2) return { emoji: "⭐", label: "ممتاز، واصل" };
    return              { emoji: "💫", label: "أداء جيد جداً" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أداء جيد جداً (5-6 نقاط)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today >= 5) {
    if (diff >= 4)  return { emoji: "📈", label: "تحسن رائع اليوم" };
    if (diff >= 2)  return { emoji: "🚀", label: "في تقدم واضح" };
    if (diff === 1) return { emoji: "🌟", label: "أداء جيد جداً" };
    if (diff === 0) {
      if (aboveAvg) return { emoji: "🏆", label: "مستمر في التميز" };
      return             { emoji: "😊", label: "ثابت ومتميز" };
    }
    if (diff >= -2) return { emoji: "⭐", label: "جيد جداً، واصل" };
    return              { emoji: "🌿", label: "جيد، ويمكنك الأفضل" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // أداء جيد (3-4 نقاط)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today >= 3) {
    if (diff >= 3)  return { emoji: "📈", label: "تحسن ملحوظ" };
    if (diff >= 2)  return { emoji: "🚀", label: "خطوات جميلة للأمام" };
    if (diff === 1) return { emoji: "💪", label: "في تقدم" };
    if (diff === 0) {
      if (aboveAvg) return { emoji: "😊", label: "جيد ومستقر" };
      return             { emoji: "🙂", label: "مستمر" };
    }
    if (diff === -1) return { emoji: "🌿", label: "جيد، واصل" };
    if (diff === -2) return { emoji: "💪", label: "قادر على الأفضل" };
    return               { emoji: "🎯", label: "يمكنك العودة للأفضل" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // نقطتان
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today === 2) {
    if (diff >= 2)  return { emoji: "💪", label: "تحسن جيد" };
    if (diff === 1) return { emoji: "🌱", label: "خطوة للأمام" };
    if (diff === 0) return { emoji: "🙂", label: "مستمر" };
    if (diff === -1) return { emoji: "🌿", label: "في الطريق الصحيح" };
    return               { emoji: "💪", label: "قادر على الأفضل" };
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // نقطة واحدة
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (today === 1) {
    if (yesterday === 0) return { emoji: "🌱", label: "بداية موفقة" };
    if (diff === 0)      return { emoji: "🙂", label: "حاضر ومستمر" };
    if (diff > 0)        return { emoji: "🌱", label: "خطوة في الطريق" };
    return                    { emoji: "🌼", label: "كل يوم فرصة جديدة" };
  }

  return { emoji: "🌱", label: "بداية جديدة" };
                          }
