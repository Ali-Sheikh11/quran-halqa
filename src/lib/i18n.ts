// src/lib/i18n.ts

export type Locale = "ar" | "tr";

export const translations = {
  ar: {
    // StatsBar
    statsStudents:  "عدد الطلاب",
    statsTotal:     "مجموع النقاط",
    statsAverage:   "متوسط النقاط",
    statsTop:       "أفضل طالب",
    statsNone:      "—",

    // StudentCard + ProgressBar
    points:         "نقطة",

    // HallOfFame
    hallOfFame:     "قاعة الشرف",

    // StudentsManager
    searchPlaceholder: "ابحث باسم الطالب...",
    addStudent:        "إضافة طالب",
    studentCount:      "طالب",
    studentCountPlural:"طالبًا",
    outOf:             "من أصل",
    noStudentsAdmin:   "لا يوجد طلاب بعد. اضغط على «إضافة طالب» للبدء.",
    noStudentsPublic:  "لا يوجد طلاب مسجَّلون بعد.",
    noSearchResults:   "لا توجد نتائج مطابقة لبحثك.",
    pointsError:       "تعذّر تحديث النقاط. تأكد من تسجيل دخولك كمسؤول وحاول مجددًا.",

    // Header
    studentsNav:    "الطلاب والترتيب",
    adminNav:       "لوحة التحكم",
    loginNav:       "دخول المسؤول",

    // Lang toggle
    langFlag:       "🇹🇷",
    langLabel:      "Türkçe",
  },

  tr: {
    // StatsBar
    statsStudents:  "Öğrenci Sayısı",
    statsTotal:     "Toplam Puan",
    statsAverage:   "Ortalama Puan",
    statsTop:       "En İyi Öğrenci",
    statsNone:      "—",

    // StudentCard + ProgressBar
    points:         "puan",

    // HallOfFame
    hallOfFame:     "Şeref Salonu",

    // StudentsManager
    searchPlaceholder: "Öğrenci adıyla ara...",
    addStudent:        "Öğrenci Ekle",
    studentCount:      "öğrenci",
    studentCountPlural:"öğrenci",
    outOf:             "/ toplam",
    noStudentsAdmin:   "Henüz öğrenci yok. «Öğrenci Ekle» butonuna tıklayın.",
    noStudentsPublic:  "Henüz kayıtlı öğrenci bulunmuyor.",
    noSearchResults:   "Aramanızla eşleşen sonuç bulunamadı.",
    pointsError:       "Puan güncellenemedi. Yönetici olarak giriş yaptığınızdan emin olun.",

    // Header
    studentsNav:    "Öğrenciler ve Sıralama",
    adminNav:       "Yönetim Paneli",
    loginNav:       "Yönetici Girişi",

    // Lang toggle
    langFlag:       "🇸🇦",
    langLabel:      "العربية",
  },
} as const;

export type TranslationKey = keyof typeof translations.ar;

/** الدالة الرئيسية — تُستدعى مرة واحدة في كل مكوّن */
export function getTranslations(locale: Locale) {
  return translations[locale];
}

/** قراءة اللغة المحفوظة من localStorage (أو العربية افتراضياً) */
export function getSavedLocale(): Locale {
  if (typeof window === "undefined") return "ar";
  return (localStorage.getItem("manarah-locale") as Locale) ?? "ar";
}

/** حفظ اللغة في localStorage */
export function saveLocale(locale: Locale): void {
  localStorage.setItem("manarah-locale", locale);
}
