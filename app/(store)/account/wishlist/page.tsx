import { Metadata } from "next";
import WishlistClient from "./WishlistClient";

export const metadata: Metadata = {
  title: "My Wishlist",
  description: "View your saved products",
};

export default function WishlistPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          My Wishlist
        </h1>
        <p className="text-gray-400">
          Your favorite products saved for later
        </p>
      </div>

      <WishlistClient />
    </div>
  );
}
