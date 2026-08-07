import { Metadata } from "next";
import CategoriesClient from "./CategoriesClient";

export const metadata: Metadata = {
  title: "Shop Management | Admin",
  description: "Manage shop categories and storefront",
};

export default function AdminCategoriesPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Shop Management
        </h1>
        <p className="text-gray-400">Add, edit, and organize product categories for your storefront</p>
      </div>

      <CategoriesClient />
    </div>
  );
}
