export type Quote = {
  type: "verse" | "hadith";
  text: string;
  source: string;
};

/**
 * مجموعة آيات قرآنية وأحاديث نبوية صحيحة عن فضل القرآن وتعلّمه،
 * تُعرض بالتناوب في الصفحة الرئيسية (تتغيّر تلقائيًا كل يوم).
 * يمكن إضافة المزيد إلى هذه القائمة في أي وقت دون لمس بقية الكود.
 */
export const quotes: Quote[] = [
  {
    type: "verse",
    text: "وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا",
    source: "سورة المزّمّل، الآية 4",
  },
  {
    type: "verse",
    text: "إِنَّ هَـٰذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ",
    source: "سورة الإسراء، الآية 9",
  },
  {
    type: "verse",
    text: "وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ",
    source: "سورة القمر، الآية 17",
  },
  {
    type: "verse",
    text: "وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ",
    source: "سورة الإسراء، الآية 82",
  },
  {
    type: "hadith",
    text: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    source: "رواه البخاري",
  },
  {
    type: "hadith",
    text: "اقْرَءُوا الْقُرْآنَ فَإِنَّهُ يَأْتِي يَوْمَ الْقِيَامَةِ شَفِيعًا لِأَصْحَابِهِ",
    source: "رواه مسلم",
  },
  {
    type: "hadith",
    text: "مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا",
    source: "رواه الترمذي",
  },
];

/**
 * يختار اقتباسًا بحسب رقم اليوم في السنة، بحيث يتغيّر تلقائيًا كل يوم
 * بشكل متّسق بين السيرفر والمتصفح (بدون استخدام Math.random لتفادي
 * مشاكل الـ hydration بين السيرفر والعميل).
 */
export function getQuoteOfTheDay(): Quote {
  const now = new Date();
  const start = Date.UTC(now.getUTCFullYear(), 0, 0);
  const diff = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - start;
  const dayOfYear = Math.floor(diff / 86400000);
  return quotes[dayOfYear % quotes.length];
}
