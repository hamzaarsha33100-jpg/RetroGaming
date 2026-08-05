"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  Eye,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

interface Order {
  _id: string;
  orderId: string;
  items: {
    product: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    total: number;
  }[];
  total: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  createdAt: string;
  updatedAt: string;
}

const statusConfig = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  processing: {
    label: "Processing",
    icon: Package,
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-500/10 text-red-500 border-red-500/20",
  },
};

export default function OrdersClient() {
  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["user-orders"],
    queryFn: async () => {
      const res = await fetch("/api/orders");
      if (!res.ok) throw new Error("Failed to fetch orders");
      const json = await res.json();
      return json.data ?? [];
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-900/50 rounded-2xl p-6 animate-pulse"
          >
            <div className="h-6 bg-slate-800 rounded w-1/4 mb-4" />
            <div className="h-4 bg-slate-800 rounded w-1/2 mb-2" />
            <div className="h-4 bg-slate-800 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-12 text-center">
        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
          <Package className="w-10 h-10 text-gray-600" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">No Orders Yet</h3>
        <p className="text-gray-400 mb-6">
          You haven't placed any orders yet. Start shopping to see your orders
          here!
        </p>
        <Link href="/categories">
          <Button className="bg-gradient-to-r from-purple-600 to-pink-600">
            Start Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order, index) => {
        const statusInfo = statusConfig[order.status];
        const StatusIcon = statusInfo.icon;

        return (
          <motion.div
            key={order._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition"
          >
            {/* Order Header */}
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4 pb-4 border-b border-purple-500/20">
              <div>
                <h3 className="font-bold text-white text-lg mb-1">
                  Order #{order.orderId}
                </h3>
                <p className="text-sm text-gray-400">
                  Placed on {formatDate(order.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Badge className={`${statusInfo.color} border`}>
                  <StatusIcon className="w-4 h-4 mr-1.5" />
                  {statusInfo.label}
                </Badge>

                <Link href={`/account/orders/${order._id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                </Link>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-4">
              {order.items.slice(0, 2).map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-white truncate">
                      {item.name}
                    </h4>
                    <p className="text-sm text-gray-400">
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </p>
                  </div>
                  <div className="font-semibold text-purple-400">
                    {formatPrice(item.total)}
                  </div>
                </div>
              ))}

              {order.items.length > 2 && (
                <p className="text-sm text-gray-500 text-center">
                  +{order.items.length - 2} more{" "}
                  {order.items.length - 2 === 1 ? "item" : "items"}
                </p>
              )}
            </div>

            {/* Order Total */}
            <div className="flex items-center justify-between pt-4 border-t border-purple-500/20">
              <span className="text-gray-400">Order Total:</span>
              <span className="text-xl font-bold text-purple-400">
                {formatPrice(order.total)}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
