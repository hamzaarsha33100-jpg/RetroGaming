import { Metadata } from "next";
import OrdersClient from "./OrdersClient";

export const metadata: Metadata = {
  title: "Orders Management | Admin",
  description: "Manage all customer orders",
};

export default function AdminOrdersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Orders Management</h1>
        <p className="text-gray-400">
          View and manage all customer orders
        </p>
      </div>

      <OrdersClient />
    </div>
  );
}
