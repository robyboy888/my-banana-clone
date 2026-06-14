import type { Metadata } from "next";
import ZodiacClient from "./ZodiacClient";

export const metadata: Metadata = {
  title: "3D Zodiac Guide",
  description:
    "Browse an interactive 3D zodiac guide with date ranges, traits, lucky windows, and entertainment-focused horoscope notes.",
  alternates: {
    canonical: "/zodiac",
  },
  openGraph: {
    title: "3D Zodiac Guide | Banana Clone",
    description:
      "Browse an interactive 3D zodiac guide with date ranges, traits, and entertainment-focused horoscope notes.",
    url: "/zodiac",
  },
};

export default function ZodiacPage() {
  return <ZodiacClient />;
}
