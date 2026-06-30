import IslamicPattern from "@/components/IslamicPattern";

/**
 * شريط روحاني هادئ أعلى صفحة إدارة الطلاب — حديث نبوي شريف عن فضل
 * تعلّم القرآن وتعليمه، بزخرفة خفيفة جدًا في الخلفية لا تُشتت الانتباه.
 */
export default function QuranicBanner() {
  return (
    <div className="corner-ornament relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-l from-emerald-800 via-emerald-700 to-emerald-800 px-6 py-6 text-center shadow-ornate sm:py-7">
      <IslamicPattern className="opacity-[0.06]" />
      <p className="relative font-verse text-lg leading-loose text-sand sm:text-xl md:text-2xl">
        «خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ»
      </p>
      <p className="relative mt-2 text-xs font-semibold tracking-wide text-gold-light">
        رواه البخاري
      </p>
    </div>
  );
}
