import { Metadata } from "next";
import { notFound } from "next/navigation";
import OrderDetailClient from "./OrderDetailClient";
import dbConnect from "@/lib/db";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Order Details",
};

interface OrderPageProps {
  params: {
    id: string;
  };
}

export default async function OrderDetailPage({ params }: OrderPageProps) {
  const session = await auth();

  if (!session?.user) {
    notFound();
  }

  await dbConnect();

  const order = await Order.findOne({
    _id: params.id,
    user: session.user.id,
  }).lean();

  if (!order) {
    notFound();
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Order Details
        </h1>
        <p className="text-gray-400">
          Track your order and view full details
        </p>
      </div>

      <OrderDetailClient order={JSON.parse(JSON.stringify(order))} />
    </div>
  );
}
