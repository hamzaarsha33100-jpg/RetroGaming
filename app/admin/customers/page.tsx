import { Metadata } from "next";
import CustomersClient from "./CustomersClient";

export const metadata: Metadata = {
  title: "Customers Management | Admin",
  description: "View and manage all customers",
};

export default function AdminCustomersPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Customers Management
        </h1>
        <p className="text-gray-400">View and manage all registered users</p>
      </div>

      <CustomersClient />
    </div>
  );
}
