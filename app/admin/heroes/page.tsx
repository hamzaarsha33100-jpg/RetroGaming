import { Metadata } from "next";
import HeroesClient from "./HeroesClient";

export const metadata: Metadata = {
  title: "Hero Slides Management | Admin",
  description: "Manage hero slides for the homepage",
};

export default function AdminHeroesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Hero Slides Management
        </h1>
        <p className="text-gray-400">Manage homepage hero slides</p>
      </div>

      <HeroesClient />
    </div>
  );
}
