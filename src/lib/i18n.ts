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
    studentsNav:    "الطلاب",
    adminNav:       "لوحة التحكم",
    loginNav:       "تسجيل دخول المسؤول",

    // students/page.tsx
    studentsTitle:       "الطلاب",
    studentsDescAdmin:   "يمكنك إضافة طلاب جدد، وتعديل أسمائهم وصورهم، أو حذفهم.",
    studentsDescViewer:  "عرض قائمة طلاب الحلقة الحالية.",
    pointsSystemTitle:   "📋 آلية احتساب النقاط",
    pointsSystemNote:    "النقاط وسيلة للتشجيع والتحفيز، وهدفها غرس حب القرآن، وحسن الخلق، والالتزام بآداب الحلقة، وليست معيارًا للتفاضل بين الطلاب.",
    pointsItem1:  "الحفظ والمراجعة",
    pointsItem2:  "جودة التسميع",
    pointsItem3:  "المواظبة على الحضور",
    pointsItem4:  "حسن التعاون",
    pointsItem5:  "الأدب وحسن الخلق",
    pointsItem6:  "المشاركة والاجتهاد",
    pointsItem7:  "احترام آداب الحلقة",

    // page.tsx (الرئيسية)
    heroDesc:     "حلقة قرآنية مباركة نتابع فيها حفظ أبنائنا خطوة بخطوة، ونحتسب كل آية يحفظونها وكل جهد يبذلونه، تشجيعًا لهم على التنافس في الخير والثبات على كتاب الله.",
    heroBtn:      "تابع الطلاب وترتيبهم",
    card1Title:   "فضل حفظ القرآن",
    card2Title:   "التنافس في الخير",
    card3Title:   "صبر وثبات",

    // Lang toggle
    langFlag:     "🇹🇷",
    langLabel:    "Türkçe",
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
    studentsNav:    "Öğrenciler",
    adminNav:       "Yönetim Paneli",
    loginNav:       "Yönetici Girişi",

    // students/page.tsx
    studentsTitle:       "Öğrenciler",
    studentsDescAdmin:   "Yeni öğrenci ekleyebilir, isim ve fotoğraflarını düzenleyebilir veya silebilirsiniz.",
    studentsDescViewer:  "Halka öğrencilerinin güncel listesi.",
    pointsSystemTitle:   "📋 Puan Sistemi",
    pointsSystemNote:    "Puanlar teşvik amaçlıdır; Kur'an sevgisini, güzel ahlakı ve halka adabını pekiştirmeyi hedefler. Öğrenciler arasında üstünlük ölçütü değildir.",
    pointsItem1:  "Hıfz ve Tekrar",
    pointsItem2:  "Seslendirme Kalitesi",
    pointsItem3:  "Düzenli Katılım",
    pointsItem4:  "İyi İşbirliği",
    pointsItem5:  "Edep ve Güzel Ahlak",
    pointsItem6:  "Katılım ve Çaba",
    pointsItem7:  "Halka Adabına Saygı",

    // page.tsx (الرئيسية)
    heroDesc:     "Çocuklarımızın Kur'an hıfzını adım adım takip ettiğimiz mübarek bir halka; ezberledikleri her ayeti ve gösterdikleri her çabayı değerlendirerek onları hayırda yarışmaya teşvik ediyoruz.",
    heroBtn:      "Öğrencileri ve Sıralamayı Görüntüle",
    card1Title:   "Kur'an Hıfzının Fazileti",
    card2Title:   "Hayırda Yarışmak",
    card3Title:   "Sabır ve Sebat",

    // Lang toggle
    langFlag:     "🇸🇦",
    langLabel:    "العربية",
  },
} as const;

export type TranslationKey = keyof typeof translations.ar;

export function getTranslations(locale: Locale) {
  return translations[locale];
}

export function getSavedLocale(): Locale {
  if (typeof window === "undefined") return "ar";
  return (localStorage.getItem("manarah-locale") as Locale) ?? "ar";
}

export function saveLocale(locale: Locale): void {
  localStorage.setItem("manarah-locale", locale);
}
