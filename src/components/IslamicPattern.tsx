/**
 * طبقة زخرفة هندسية إسلامية خفيفة جدًا (نجمة ثمانية متكررة) تُستخدم
 * كخلفية زينة فقط دون أن تشتت القارئ عن المحتوى.
 */
export default function IslamicPattern({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 bg-islamic-pattern bg-repeat opacity-[0.07] ${className}`}
    />
  );
}
