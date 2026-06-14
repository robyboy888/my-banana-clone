import type { Metadata } from "next";
import SolarSystemClient from "./SolarSystemClient";

export const metadata: Metadata = {
  title: "3D Solar System Explorer",
  description:
    "Explore the eight planets in an interactive 3D solar system experience with concise science facts.",
  alternates: {
    canonical: "/solar-system",
  },
  openGraph: {
    title: "3D Solar System Explorer | Banana Clone",
    description:
      "Explore the eight planets in an interactive 3D solar system experience.",
    url: "/solar-system",
  },
};

export default function SolarSystemPage() {
  return <SolarSystemClient />;
}
