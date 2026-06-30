const SIZE_CLASSES = {
  sm: "h-10 w-10 text-sm",
  md: "h-16 w-16 text-lg",
  lg: "h-24 w-24 text-2xl",
} as const;

export default function StudentAvatar({
  name,
  photoUrl,
  size = "md",
}: {
  name: string;
  photoUrl: string | null;
  size?: keyof typeof SIZE_CLASSES;
}) {
  const initial = name.trim().charAt(0) || "؟";
  const sizeClass = SIZE_CLASSES[size];

  if (photoUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} shrink-0 rounded-full border-2 border-gold/40 object-cover shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full border-2 border-gold/40 bg-gradient-to-br from-emerald-600 to-emerald-800 font-verse font-bold text-sand shadow-sm`}
      aria-hidden="true"
    >
      {initial}
    </div>
  );
}
