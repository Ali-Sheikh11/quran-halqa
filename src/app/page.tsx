import IslamicPattern from "@/components/IslamicPattern";
import VerseOfTheDay from "@/components/VerseOfTheDay";

export default function HomePage({
  searchParams,
}: {
  searchParams: { unauthorized?: string };
}) {
  const showUnauthorized = searchParams?.unauthorized === "1";

  return (
    <div>
      {/* قسم البطل (Hero) */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-600 pb-28 pt-16 sm:pt-20">
        <IslamicPattern />
        <div className="relative mx-auto max-w-4xl px-5">
          {showUnauthorized && (
            <div className="mx-auto mb-8 max-w-md rounded-xl border border-gold/40 bg-night/30 px-4 py-3 text-center text-sm text-sand">
              هذه الصفحة مخصّصة للمسؤول فقط. تم تحويلك إلى الصفحة الرئيسية.
            </div>
          )}

          <div className="text-center">
            <p className="mb-3 text-sm font-medium tracking-wide text-gold-light">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <h1 className="font-verse text-3xl font-bold leading-tight text-sand sm:text-4xl md:text-5xl">
              منارة القرآن
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-sand/85 sm:text-lg">
              حلقة قرآنية مباركة نتابع فيها حفظ أبنائنا خطوة بخطوة،
              ونحتسب كل آية يحفظونها وكل جهد يبذلونه، تشجيعًا لهم على
              التنافس في الخير والثبات على كتاب الله.
            </p>
          </div>

          <div className="mt-8 flex justify-center">
            <a
              href="/students"
              className="inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-bold text-night transition hover:bg-gold-light"
            >
              تابع الطلاب وترتيبهم
            </a>
          </div>

          <div className="mt-12">
            <VerseOfTheDay />
          </div>
        </div>
      </section>

      {/* بطاقات تعريفية بأساس المنصة */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          <FeatureCard
            title="فضل حفظ القرآن"
            description="«خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ» — كل آية تُحفظ هي زاد للدنيا ونور يوم القيامة، وكل جلسة في الحلقة خطوة في هذا الطريق المبارك."
          />
          <FeatureCard
            title="التنافس في الخير"
            description="﴿وَفِي ذَٰلِكَ فَلْيَتَنَافَسِ الْمُتَنَافِسُونَ﴾ — نُذكّر طلابنا دومًا أن التنافس هنا تنافسٌ محبّب، غايته التقرّب إلى الله بحفظ كتابه."
          />
          <FeatureCard
            title="صبر وثبات"
            description="حفظ القرآن رحلة صبر وتكرار، والثبات عليها بركة. نسأل الله أن يُعين كل طالب وطالبة على إتمامها وأن يجعلها في موازين حسناتهم."
          />
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-white px-6 py-7 shadow-sm transition hover:-translate-y-1 hover:shadow-ornate">
      <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <polygon points="12,3 21,12 12,21 3,12" fill="none" stroke="#0F6B45" strokeWidth="1.4" />
        </svg>
      </div>
      <h3 className="mb-2 text-lg font-bold text-emerald-800">{title}</h3>
      <p className="text-sm leading-relaxed text-night/70">{description}</p>
    </div>
  );
}
