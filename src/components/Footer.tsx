export default function Footer() {
  return (
    <footer className="relative mt-20 overflow-hidden border-t border-gold/20 bg-emerald-900">
      <div
        aria-hidden="true"
        className="bg-islamic-pattern absolute inset-0 bg-repeat opacity-[0.06]"
      />
      <div className="relative mx-auto max-w-6xl px-5 py-8 text-center">
        <p className="font-verse text-base text-gold-light">
          ﴿ وَقُل رَّبِّ زِدْنِي عِلْمًا ﴾
        </p>
        <p className="mt-3 text-xs text-sand/70">
          منارة القرآن — منصّة إدارة الحلقات القرآنية
        </p>
      </div>
    </footer>
  );
}
