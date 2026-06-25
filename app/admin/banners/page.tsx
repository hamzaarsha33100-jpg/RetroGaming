import { Metadata } from "next";
import BannersClient from "./BannersClient";

export const metadata: Metadata = {
  title: "Banners Management | Admin",
  description: "Manage homepage banners",
};

export default function AdminBannersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Banners Management
        </h1>
        <p className="text-gray-400">Manage homepage hero banners</p>
      </div>

      <BannersClient />
    </div>
  );
}
