// src/app/page.tsx
import IslamicPattern from "@/components/IslamicPattern";
import VerseOfTheDay from "@/components/VerseOfTheDay";
import HomePageClient from "./HomePageClient";

export default function HomePage({
  searchParams,
}: {
  searchParams: { unauthorized?: string };
}) {
  return (
    <HomePageClient unauthorized={searchParams?.unauthorized === "1"} />
  );
}
