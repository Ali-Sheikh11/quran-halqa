import { getQuoteOfTheDay } from "@/lib/content/quotes";

export default function VerseOfTheDay() {
  const quote = getQuoteOfTheDay();
  const isVerse = quote.type === "verse";

  return (
    <div className="mx-auto w-full max-w-2xl animate-fade-up">
      {/* قوس زخرفي يعلو البطاقة، مستوحى من شكل المحراب */}
      <svg
        viewBox="0 0 400 100"
        className="block w-full"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="archFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0F6B45" />
            <stop offset="100%" stopColor="#0A4A30" />
          </linearGradient>
        </defs>
        <path
          d="M30,100 C30,50 110,14 200,14 C290,14 370,50 370,100 Z"
          fill="url(#archFill)"
        />
        <path
          d="M30,100 C30,50 110,14 200,14 C290,14 370,50 370,100"
          fill="none"
          stroke="#C9A227"
          strokeWidth="2"
        />
        {/* نجمة ثمانية صغيرة داخل القوس */}
        <g transform="translate(200,58)" stroke="#E8D9A8" strokeWidth="1" fill="none" opacity="0.85">
          <polygon points="0,-16 16,0 0,16 -16,0" />
          <polygon points="11.3,-11.3 11.3,11.3 -11.3,11.3 -11.3,-11.3" />
        </g>
      </svg>

      {/* بطاقة المحتوى */}
      <div className="corner-ornament relative rounded-b-2xl border border-t-0 border-gold/30 bg-white/90 px-6 py-10 text-center shadow-ornate backdrop-blur-sm sm:px-12 sm:py-12">
        <span className="mb-5 inline-block rounded-full border border-gold/40 bg-gold-light/30 px-4 py-1 text-xs font-semibold tracking-wide text-gold-deep">
          {isVerse ? "آية اليوم" : "حديث اليوم"}
        </span>

        <p className="font-verse text-2xl leading-loose text-emerald-800 sm:text-3xl md:text-4xl">
          {isVerse ? `﴿ ${quote.text} ﴾` : `«${quote.text}»`}
        </p>

        <div className="mx-auto my-5 h-px w-24 bg-gradient-to-l from-transparent via-gold to-transparent" />

        <p className="font-sans text-sm font-medium text-gold-deep">{quote.source}</p>
      </div>
    </div>
  );
}
