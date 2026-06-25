import { Metadata } from "next";
import CouponsClient from "./CouponsClient";

export const metadata: Metadata = {
  title: "Coupons Management | Admin",
  description: "Manage discount coupons",
};

export default function AdminCouponsPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Coupons Management
        </h1>
        <p className="text-gray-400">Create and manage discount coupons</p>
      </div>

      <CouponsClient />
    </div>
  );
}
