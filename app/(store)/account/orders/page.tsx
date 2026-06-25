import { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "My Orders",
  description: "View and track your orders",
};

export default function OrdersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          My Orders
        </h1>
        <p className="text-gray-400">
          View and track all your orders in one place
        </p>
      </div>

      <OrdersClient />
    </div>
  );
}
