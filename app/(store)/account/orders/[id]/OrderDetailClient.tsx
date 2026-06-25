"use client";

import { motion } from "framer-motion";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  MapPin,
  CreditCard,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface OrderDetailClientProps {
  order: any;
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

export default function OrderDetailClient({ order }: OrderDetailClientProps) {
  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
  const StatusIcon = statusInfo.icon;

  return (
    <div className="space-y-6">
      {/* Order Header */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              Order #{order.orderNumber}
            </h2>
            <p className="text-gray-400">
              Placed on {formatDate(order.createdAt)}
            </p>
          </div>

          <Badge className={`${statusInfo.color} border text-base px-4 py-2`}>
            <StatusIcon className="w-5 h-5 mr-2" />
            {statusInfo.label}
          </Badge>
        </div>
      </div>

      {/* Order Timeline */}
      {order.timeline && order.timeline.length > 0 && (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
          <h3 className="font-bold text-white text-lg mb-4">Order Timeline</h3>
          <div className="space-y-4">
            {order.timeline.map((event: any, index: number) => {
              const eventStatusInfo = statusConfig[event.status as keyof typeof statusConfig];
              const EventIcon = eventStatusInfo.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className={`p-2 rounded-full ${eventStatusInfo.color}`}>
                    <EventIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{eventStatusInfo.label}</p>
                    <p className="text-sm text-gray-400">
                      {formatDate(event.timestamp)}
                    </p>
                    {event.note && (
                      <p className="text-sm text-gray-400 mt-1">{event.note}</p>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shipping Address */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-lg">Shipping Address</h3>
          </div>
          <div className="text-gray-300 space-y-1">
            <p className="font-medium">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p>{order.shippingAddress.address1}</p>
            {order.shippingAddress.address2 && (
              <p>{order.shippingAddress.address2}</p>
            )}
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zipCode}
            </p>
            <p>{order.shippingAddress.country}</p>
            {order.shippingAddress.phone && (
              <p className="mt-2">Phone: {order.shippingAddress.phone}</p>
            )}
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-purple-400" />
            <h3 className="font-bold text-white text-lg">Payment Information</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Payment Status:</span>
              <Badge
                className={`${
                  order.paymentStatus === "paid"
                    ? "bg-green-500/10 text-green-500"
                    : order.paymentStatus === "pending"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-red-500/10 text-red-500"
                }`}
              >
                {order.paymentStatus.toUpperCase()}
              </Badge>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>Payment Method:</span>
              <span className="font-medium">
                {order.paymentMethod || "Card"}
              </span>
            </div>
            {order.stripePaymentIntentId && (
              <div className="flex justify-between text-gray-400 text-sm">
                <span>Transaction ID:</span>
                <span className="font-mono text-xs">
                  {order.stripePaymentIntentId.substring(0, 20)}...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Items */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
        <h3 className="font-bold text-white text-lg mb-4">Order Items</h3>
        <div className="space-y-4">
          {order.items.map((item: any, index: number) => (
            <div
              key={index}
              className="flex items-center gap-4 pb-4 border-b border-purple-500/10 last:border-0 last:pb-0"
            >
              <div className="w-20 h-20 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-white mb-1">{item.name}</h4>
                <p className="text-sm text-gray-400">
                  {formatPrice(item.price)} × {item.quantity}
                </p>
              </div>
              <div className="font-bold text-purple-400">
                {formatPrice(item.total)}
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="mt-6 pt-6 border-t border-purple-500/20 space-y-2">
          <div className="flex justify-between text-gray-400">
            <span>Subtotal:</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-green-400">
              <span>Discount:</span>
              <span>-{formatPrice(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-gray-400">
            <span>Shipping:</span>
            <span>
              {order.shipping === 0 ? "FREE" : formatPrice(order.shipping)}
            </span>
          </div>
          {order.tax > 0 && (
            <div className="flex justify-between text-gray-400">
              <span>Tax:</span>
              <span>{formatPrice(order.tax)}</span>
            </div>
          )}
          <div className="flex justify-between text-xl font-bold text-white pt-2 border-t border-purple-500/20">
            <span>Total:</span>
            <span className="text-purple-400">{formatPrice(order.total)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/account/orders" className="flex-1">
          <Button variant="outline" className="w-full">
            Back to Orders
          </Button>
        </Link>
        <Button className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600">
          Download Invoice
        </Button>
      </div>
    </div>
  );
}
