"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package,
  Eye,
  Search,
  Filter,
  Download,
  Clock,
  CheckCircle,
  XCircle,
  Truck,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  MapPin,
  X,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
};

const formatDateTime = (date: string) => {
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
};

interface OrderItem {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

interface OrderAddress {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

interface OrderTimeline {
  status: string;
  message: string;
  timestamp: string;
}

interface Order {
  _id: string;
  orderId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCost: number;
  tax: number;
  total: number;
  couponCode?: string;
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentMethod?: string;
  shippingAddress: OrderAddress;
  billingAddress: OrderAddress;
  trackingNumber?: string;
  trackingUrl?: string;
  notes?: string;
  timeline: OrderTimeline[];
  estimatedDelivery?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<
  string,
  { label: string; icon: typeof Clock; color: string; dotColor: string }
> = {
  pending: {
    label: "Pending",
    icon: Clock,
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
    dotColor: "bg-yellow-400",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    color: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    dotColor: "bg-blue-400",
  },
  processing: {
    label: "Processing",
    icon: Package,
    color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
    dotColor: "bg-cyan-400",
  },
  shipped: {
    label: "Shipped",
    icon: Truck,
    color: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    dotColor: "bg-purple-400",
  },
  delivered: {
    label: "Delivered",
    icon: CheckCircle,
    color: "bg-green-500/10 text-green-400 border-green-500/30",
    dotColor: "bg-green-400",
  },
  cancelled: {
    label: "Cancelled",
    icon: XCircle,
    color: "bg-red-500/10 text-red-400 border-red-500/30",
    dotColor: "bg-red-400",
  },
};

const paymentStatusConfig: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  paid: "bg-green-500/10 text-green-400 border-green-500/30",
  failed: "bg-red-500/10 text-red-400 border-red-500/30",
  refunded: "bg-orange-500/10 text-orange-400 border-orange-500/30",
};

const ITEMS_PER_PAGE = 10;

export default function OrdersClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    orderId: string;
    action: string;
    label: string;
  } | null>(null);
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["admin-orders", statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);

      const res = await fetch(`/api/admin/orders?${params}`);
      if (!res.ok) throw new Error("Failed to fetch orders");
      return res.json();
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: string;
    }) => {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update order");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated successfully!");
      setSelectedOrder(null);
      setConfirmAction(null);
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  const filteredOrders = useMemo(() => {
    return orders.filter(
      (order) =>
        order.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [orders, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredOrders.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredOrders, currentPage]);

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const handleExportCSV = () => {
    const headers = [
      "Order ID",
      "Customer",
      "Email",
      "Date",
      "Subtotal",
      "Tax",
      "Shipping",
      "Discount",
      "Total",
      "Status",
      "Payment Status",
    ];

    const rows = filteredOrders.map((order) => [
      order.orderId,
      order.user.name,
      order.user.email,
      formatDate(order.createdAt),
      order.subtotal.toFixed(2),
      order.tax.toFixed(2),
      order.shippingCost.toFixed(2),
      order.discount.toFixed(2),
      order.total.toFixed(2),
      order.status,
      order.paymentStatus,
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    toast.success("Orders exported successfully!");
  };

  const handleQuickAction = (orderId: string, action: string, label: string) => {
    setConfirmAction({ orderId, action, label });
  };

  const confirmQuickAction = () => {
    if (!confirmAction) return;
    handleStatusUpdate(confirmAction.orderId, confirmAction.action);
  };

  const getStatusCounts = () => {
    const counts: Record<string, number> = {
      all: orders.length,
      pending: 0,
      confirmed: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
    };
    orders.forEach((order) => {
      if (counts[order.status] !== undefined) {
        counts[order.status]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="bg-gaming-surface/50 rounded-2xl p-6 animate-pulse"
          >
            <div className="h-6 bg-gaming-border rounded w-1/4 mb-4" />
            <div className="h-4 bg-gaming-border rounded w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const renderOrderRow = (order: Order) => {
    const statusInfo = statusConfig[order.status];
    const StatusIcon = statusInfo.icon;
    const isExpanded = expandedRow === order._id;

    return (
      <motion.div
        key={order._id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group"
      >
        {/* Desktop Row */}
        <div className="hidden lg:grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_1fr_0.8fr_1fr] gap-4 items-center px-6 py-4 hover:bg-gaming-surfaceLight/30 transition-colors">
          <div>
            <div className="font-medium text-gaming-text">
              #{order.orderId}
            </div>
            <div className="text-sm text-gaming-textMuted">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div>
            <div className="font-medium text-gaming-text truncate">
              {order.user.name}
            </div>
            <div className="text-sm text-gaming-textMuted truncate">
              {order.user.email}
            </div>
          </div>

          <div className="text-sm text-gaming-textMuted">
            {formatDate(order.createdAt)}
          </div>

          <div>
            <div className="font-bold text-neon-cyan">
              {formatPrice(order.total)}
            </div>
            {order.discount > 0 && (
              <div className="text-xs text-green-400">
                -{formatPrice(order.discount)} off
              </div>
            )}
          </div>

          <div>
            <Badge className={`${statusInfo.color} border`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor} mr-1.5`} />
              {statusInfo.label}
            </Badge>
          </div>

          <div>
            <Badge
              className={`${paymentStatusConfig[order.paymentStatus]} border`}
            >
              {order.paymentStatus.charAt(0).toUpperCase() +
                order.paymentStatus.slice(1)}
            </Badge>
          </div>

          <div className="flex items-center gap-2 justify-end">
            {order.status === "pending" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 h-8"
                onClick={() =>
                  handleQuickAction(order._id, "confirmed", "Confirm")
                }
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </Button>
            )}
            {(order.status === "confirmed" || order.status === "pending") && (
              <Button
                size="sm"
                variant="ghost"
                className="text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 h-8"
                onClick={() =>
                  handleQuickAction(order._id, "processing", "Process")
                }
              >
                <Package className="w-3.5 h-3.5" />
              </Button>
            )}
            {order.status === "processing" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 h-8"
                onClick={() =>
                  handleQuickAction(order._id, "shipped", "Ship")
                }
              >
                <Truck className="w-3.5 h-3.5" />
              </Button>
            )}
            {order.status === "shipped" && (
              <Button
                size="sm"
                variant="ghost"
                className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8"
                onClick={() =>
                  handleQuickAction(order._id, "delivered", "Deliver")
                }
              >
                <CheckCircle className="w-3.5 h-3.5" />
              </Button>
            )}
            {order.paymentStatus !== "paid" &&
              order.status !== "cancelled" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-green-400 hover:text-green-300 hover:bg-green-500/10 h-8"
                  onClick={() =>
                    handleQuickAction(order._id, "paid", "Mark Paid")
                  }
                >
                  <CreditCard className="w-3.5 h-3.5" />
                </Button>
              )}
            {order.status !== "cancelled" &&
              order.status !== "delivered" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 h-8"
                  onClick={() =>
                    handleQuickAction(order._id, "cancelled", "Cancel")
                  }
                >
                  <XCircle className="w-3.5 h-3.5" />
                </Button>
              )}
            <Button
              size="sm"
              variant="ghost"
              className="text-gaming-textMuted hover:text-neon-cyan h-8"
              onClick={() =>
                setExpandedRow(isExpanded ? null : order._id)
              }
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-gaming-textMuted hover:text-neon-cyan h-8"
              onClick={() => setSelectedOrder(order)}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Expanded Details (Desktop) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="hidden lg:block overflow-hidden"
            >
              <div className="px-6 pb-4 pt-2 border-t border-gaming-border/50">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold text-gaming-textMuted uppercase tracking-wider mb-2">
                      Items
                    </h4>
                    <div className="space-y-2">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-8 h-8 rounded object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gaming-text truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gaming-textMuted">
                              {item.quantity} × {formatPrice(item.price)}
                            </p>
                          </div>
                          <span className="text-sm font-medium text-gaming-text">
                            {formatPrice(item.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gaming-textMuted uppercase tracking-wider mb-2">
                      Shipping Address
                    </h4>
                    <div className="text-sm text-gaming-text">
                      <p>
                        {order.shippingAddress.firstName}{" "}
                        {order.shippingAddress.lastName}
                      </p>
                      <p className="text-gaming-textMuted">
                        {order.shippingAddress.address1}
                      </p>
                      <p className="text-gaming-textMuted">
                        {order.shippingAddress.city},{" "}
                        {order.shippingAddress.state}{" "}
                        {order.shippingAddress.zipCode}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gaming-textMuted uppercase tracking-wider mb-2">
                      Order Summary
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gaming-textMuted">Subtotal</span>
                        <span className="text-gaming-text">
                          {formatPrice(order.subtotal)}
                        </span>
                      </div>
                      {order.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gaming-textMuted">Discount</span>
                          <span className="text-green-400">
                            -{formatPrice(order.discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gaming-textMuted">Tax</span>
                        <span className="text-gaming-text">
                          {formatPrice(order.tax)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gaming-textMuted">Shipping</span>
                        <span className="text-gaming-text">
                          {order.shippingCost === 0
                            ? "Free"
                            : formatPrice(order.shippingCost)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-gaming-border pt-1">
                        <span className="text-gaming-text">Total</span>
                        <span className="text-neon-cyan">
                          {formatPrice(order.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Card */}
        <div className="lg:hidden mx-4 mb-3 bg-gaming-surfaceLight/50 border border-gaming-border/50 rounded-xl p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium text-gaming-text">
                #{order.orderId}
              </div>
              <div className="text-sm text-gaming-textMuted">
                {order.user.name}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-neon-cyan">
                {formatPrice(order.total)}
              </div>
              <div className="text-xs text-gaming-textMuted">
                {formatDate(order.createdAt)}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={`${statusInfo.color} border text-xs`}>
              <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dotColor} mr-1.5`} />
              {statusInfo.label}
            </Badge>
            <Badge
              className={`${paymentStatusConfig[order.paymentStatus]} border text-xs`}
            >
              {order.paymentStatus.charAt(0).toUpperCase() +
                order.paymentStatus.slice(1)}
            </Badge>
            <span className="text-xs text-gaming-textMuted ml-auto">
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select
              value={order.status}
              onValueChange={(value) =>
                handleStatusUpdate(order._id, value)
              }
            >
              <SelectTrigger className="h-8 text-xs bg-gaming-dark border-gaming-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gaming-surface border-gaming-border">
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key} className="text-xs">
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {order.paymentStatus !== "paid" &&
              order.status !== "cancelled" && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-green-400 hover:text-green-300 h-8 text-xs"
                  onClick={() =>
                    handleQuickAction(order._id, "paid", "Mark Paid")
                  }
                >
                  <CreditCard className="w-3 h-3 mr-1" />
                  Paid
                </Button>
              )}

            <Button
              size="sm"
              variant="ghost"
              className="text-gaming-textMuted hover:text-neon-cyan h-8 text-xs ml-auto"
              onClick={() => setSelectedOrder(order)}
            >
              <Eye className="w-3 h-3 mr-1" />
              Details
            </Button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {Object.entries(statusCounts).map(([status, count]) => {
          const config = status === "all" ? null : statusConfig[status];
          return (
            <button
              key={status}
              onClick={() => {
                setStatusFilter(status);
                setCurrentPage(1);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                statusFilter === status
                  ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30"
                  : "bg-gaming-surface border border-gaming-border text-gaming-textMuted hover:text-gaming-text hover:border-gaming-border"
              }`}
            >
              {config && (
                <span
                  className={`w-2 h-2 rounded-full ${config.dotColor}`}
                />
              )}
              {status === "all" ? "All" : config?.label}
              <span className="text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Search & Export */}
      <div className="bg-gaming-surface/50 backdrop-blur-xl border border-gaming-border rounded-2xl p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gaming-textMuted" />
            <Input
              type="text"
              placeholder="Search by order ID, customer name, or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-10 bg-gaming-dark border-gaming-border text-gaming-text placeholder-gaming-textMuted focus:border-neon-cyan focus:ring-neon-cyan/30"
            />
          </div>

          <Button
            variant="outline"
            className="border-gaming-border text-gaming-text hover:bg-gaming-surfaceLight hover:text-neon-cyan"
            onClick={handleExportCSV}
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Orders Table (Desktop) */}
      <div className="hidden lg:block bg-gaming-surface/50 backdrop-blur-xl border border-gaming-border rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[1fr_1.2fr_0.8fr_0.8fr_1fr_0.8fr_1fr] gap-4 px-6 py-4 border-b border-gaming-border bg-gaming-surface/80">
          <div className="text-xs font-semibold text-gaming-textMuted uppercase tracking-wider">
            Order
          </div>
          <div className="text-xs font-semibold text-gaming-textMuted uppercase tracking-wider">
            Customer
          </div>
          <div className="text-xs font-semibold text-gaming-textMuted uppercase tracking-wider">
            Date
          </div>
          <div className="text-xs font-semibold text-gaming-textMuted uppercase tracking-wider">
            Total
          </div>
          <div className="text-xs font-semibold text-gaming-textMuted uppercase tracking-wider">
            Status
          </div>
          <div className="text-xs font-semibold text-gaming-textMuted uppercase tracking-wider">
            Payment
          </div>
          <div className="text-xs font-semibold text-gaming-textMuted uppercase tracking-wider text-right">
            Actions
          </div>
        </div>

        {/* Rows */}
        <div className="divide-y divide-gaming-border/50">
          {paginatedOrders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Package className="w-14 h-14 text-gaming-textMuted/50 mx-auto mb-4" />
              <p className="text-gaming-textMuted text-lg">No orders found</p>
              <p className="text-gaming-textMuted/60 text-sm mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          ) : (
            paginatedOrders.map((order) => renderOrderRow(order))
          )}
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-0">
        {paginatedOrders.length === 0 ? (
          <div className="bg-gaming-surface/50 border border-gaming-border rounded-2xl px-6 py-16 text-center">
            <Package className="w-14 h-14 text-gaming-textMuted/50 mx-auto mb-4" />
            <p className="text-gaming-textMuted text-lg">No orders found</p>
            <p className="text-gaming-textMuted/60 text-sm mt-1">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          paginatedOrders.map((order) => renderOrderRow(order))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gaming-textMuted">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, filteredOrders.length)} of{" "}
            {filteredOrders.length} orders
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-gaming-border text-gaming-text hover:bg-gaming-surfaceLight"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
              let page: number;
              if (totalPages <= 5) {
                page = i + 1;
              } else if (currentPage <= 3) {
                page = i + 1;
              } else if (currentPage >= totalPages - 2) {
                page = totalPages - 4 + i;
              } else {
                page = currentPage - 2 + i;
              }
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className={
                    currentPage === page
                      ? "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30 hover:bg-neon-cyan/20"
                      : "border-gaming-border text-gaming-text hover:bg-gaming-surfaceLight"
                  }
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              );
            })}
            <Button
              variant="outline"
              size="sm"
              className="border-gaming-border text-gaming-text hover:bg-gaming-surfaceLight"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Quick Action Confirmation Dialog */}
      <Dialog
        open={!!confirmAction}
        onOpenChange={() => setConfirmAction(null)}
      >
        <DialogContent className="bg-gaming-surface border-gaming-border max-w-md">
          <DialogHeader>
            <DialogTitle className="text-gaming-text flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Confirm Action
            </DialogTitle>
            <DialogDescription className="text-gaming-textMuted">
              Are you sure you want to{" "}
              <span className="text-gaming-text font-medium lowercase">
                {confirmAction?.label}
              </span>{" "}
              this order?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={() => setConfirmAction(null)}
              className="border-gaming-border text-gaming-text hover:bg-gaming-surfaceLight"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmQuickAction}
              disabled={updateStatusMutation.isPending}
              className={
                confirmAction?.action === "cancelled"
                  ? "bg-red-600 hover:bg-red-700 text-white"
                  : confirmAction?.action === "paid"
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-neon-cyan/20 text-neon-cyan hover:bg-neon-cyan/30 border border-neon-cyan/30"
              }
            >
              {updateStatusMutation.isPending ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Detail Modal */}
      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gaming-surface border-gaming-border">
          {selectedOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl text-gaming-text flex items-center gap-3">
                  <Package className="w-6 h-6 text-neon-cyan" />
                  Order #{selectedOrder.orderId}
                </DialogTitle>
                <DialogDescription className="text-gaming-textMuted">
                  Placed on {formatDateTime(selectedOrder.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Status Overview */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="bg-gaming-dark rounded-xl p-3 border border-gaming-border">
                    <p className="text-xs text-gaming-textMuted mb-1">Status</p>
                    <Badge
                      className={`${statusConfig[selectedOrder.status].color} border`}
                    >
                      {statusConfig[selectedOrder.status].label}
                    </Badge>
                  </div>
                  <div className="bg-gaming-dark rounded-xl p-3 border border-gaming-border">
                    <p className="text-xs text-gaming-textMuted mb-1">Payment</p>
                    <Badge
                      className={`${paymentStatusConfig[selectedOrder.paymentStatus]} border`}
                    >
                      {selectedOrder.paymentStatus.charAt(0).toUpperCase() +
                        selectedOrder.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  <div className="bg-gaming-dark rounded-xl p-3 border border-gaming-border">
                    <p className="text-xs text-gaming-textMuted mb-1">Total</p>
                    <p className="font-bold text-neon-cyan">
                      {formatPrice(selectedOrder.total)}
                    </p>
                  </div>
                  <div className="bg-gaming-dark rounded-xl p-3 border border-gaming-border">
                    <p className="text-xs text-gaming-textMuted mb-1">Items</p>
                    <p className="font-bold text-gaming-text">
                      {selectedOrder.items.length}
                    </p>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="bg-gaming-dark rounded-xl p-4 border border-gaming-border">
                  <h3 className="font-semibold text-gaming-text mb-3">
                    Customer
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gaming-textMuted">Name: </span>
                      <span className="text-gaming-text">
                        {selectedOrder.user.name}
                      </span>
                    </div>
                    <div>
                      <span className="text-gaming-textMuted">Email: </span>
                      <span className="text-gaming-text">
                        {selectedOrder.user.email}
                      </span>
                    </div>
                    {selectedOrder.paymentMethod && (
                      <div>
                        <span className="text-gaming-textMuted">
                          Payment Method:{" "}
                        </span>
                        <span className="text-gaming-text">
                          {selectedOrder.paymentMethod}
                        </span>
                      </div>
                    )}
                    {selectedOrder.couponCode && (
                      <div>
                        <span className="text-gaming-textMuted">
                          Coupon:{" "}
                        </span>
                        <span className="text-neon-cyan">
                          {selectedOrder.couponCode}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Order Items */}
                <div className="bg-gaming-dark rounded-xl p-4 border border-gaming-border">
                  <h3 className="font-semibold text-gaming-text mb-3">Items</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-3 rounded-lg bg-gaming-surface/50"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-lg border border-gaming-border"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-gaming-text font-medium truncate">
                            {item.name}
                          </p>
                          <p className="text-sm text-gaming-textMuted">
                            {item.quantity} × {formatPrice(item.price)}
                          </p>
                        </div>
                        <p className="font-bold text-neon-cyan">
                          {formatPrice(item.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gaming-dark rounded-xl p-4 border border-gaming-border">
                    <h3 className="font-semibold text-gaming-text mb-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-neon-cyan" />
                      Shipping Address
                    </h3>
                    <div className="text-sm text-gaming-text space-y-1">
                      <p>
                        {selectedOrder.shippingAddress.firstName}{" "}
                        {selectedOrder.shippingAddress.lastName}
                      </p>
                      {selectedOrder.shippingAddress.company && (
                        <p className="text-gaming-textMuted">
                          {selectedOrder.shippingAddress.company}
                        </p>
                      )}
                      <p className="text-gaming-textMuted">
                        {selectedOrder.shippingAddress.address1}
                      </p>
                      {selectedOrder.shippingAddress.address2 && (
                        <p className="text-gaming-textMuted">
                          {selectedOrder.shippingAddress.address2}
                        </p>
                      )}
                      <p className="text-gaming-textMuted">
                        {selectedOrder.shippingAddress.city},{" "}
                        {selectedOrder.shippingAddress.state}{" "}
                        {selectedOrder.shippingAddress.zipCode}
                      </p>
                      <p className="text-gaming-textMuted">
                        {selectedOrder.shippingAddress.country}
                      </p>
                      {selectedOrder.shippingAddress.phone && (
                        <p className="text-gaming-textMuted">
                          {selectedOrder.shippingAddress.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="bg-gaming-dark rounded-xl p-4 border border-gaming-border">
                    <h3 className="font-semibold text-gaming-text mb-3 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-neon-cyan" />
                      Order Summary
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gaming-textMuted">Subtotal</span>
                        <span className="text-gaming-text">
                          {formatPrice(selectedOrder.subtotal)}
                        </span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between">
                          <span className="text-gaming-textMuted">Discount</span>
                          <span className="text-green-400">
                            -{formatPrice(selectedOrder.discount)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gaming-textMuted">Tax</span>
                        <span className="text-gaming-text">
                          {formatPrice(selectedOrder.tax)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gaming-textMuted">Shipping</span>
                        <span className="text-gaming-text">
                          {selectedOrder.shippingCost === 0
                            ? "Free"
                            : formatPrice(selectedOrder.shippingCost)}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold border-t border-gaming-border pt-2 mt-2">
                        <span className="text-gaming-text">Total</span>
                        <span className="text-neon-cyan text-lg">
                          {formatPrice(selectedOrder.total)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tracking */}
                {(selectedOrder.trackingNumber || selectedOrder.trackingUrl) && (
                  <div className="bg-gaming-dark rounded-xl p-4 border border-gaming-border">
                    <h3 className="font-semibold text-gaming-text mb-3 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-neon-cyan" />
                      Tracking
                    </h3>
                    <div className="text-sm space-y-1">
                      {selectedOrder.trackingNumber && (
                        <div>
                          <span className="text-gaming-textMuted">
                            Tracking #:{" "}
                          </span>
                          <span className="text-gaming-text font-mono">
                            {selectedOrder.trackingNumber}
                          </span>
                        </div>
                      )}
                      {selectedOrder.trackingUrl && (
                        <div>
                          <a
                            href={selectedOrder.trackingUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-neon-cyan hover:underline"
                          >
                            Track Package
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {selectedOrder.notes && (
                  <div className="bg-gaming-dark rounded-xl p-4 border border-gaming-border">
                    <h3 className="font-semibold text-gaming-text mb-2">
                      Notes
                    </h3>
                    <p className="text-sm text-gaming-textMuted">
                      {selectedOrder.notes}
                    </p>
                  </div>
                )}

                {/* Timeline */}
                {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                  <div className="bg-gaming-dark rounded-xl p-4 border border-gaming-border">
                    <h3 className="font-semibold text-gaming-text mb-3">
                      Timeline
                    </h3>
                    <div className="space-y-3">
                      {selectedOrder.timeline.map((entry, idx) => {
                        const timelineStatus = statusConfig[entry.status];
                        return (
                          <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div
                                className={`w-3 h-3 rounded-full ${timelineStatus?.dotColor || "bg-gaming-textMuted"}`}
                              />
                              {idx < selectedOrder.timeline.length - 1 && (
                                <div className="w-px flex-1 bg-gaming-border mt-1" />
                              )}
                            </div>
                            <div className="pb-3">
                              <p className="text-sm font-medium text-gaming-text">
                                {entry.message}
                              </p>
                              <p className="text-xs text-gaming-textMuted">
                                {formatDateTime(entry.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Update Status */}
                <div className="bg-gaming-dark rounded-xl p-4 border border-gaming-border">
                  <h3 className="font-semibold text-gaming-text mb-3">
                    Update Status
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(statusConfig).map(([key, config]) => {
                      const Icon = config.icon;
                      return (
                        <Button
                          key={key}
                          variant="outline"
                          size="sm"
                          disabled={
                            selectedOrder.status === key ||
                            updateStatusMutation.isPending
                          }
                          onClick={() =>
                            handleStatusUpdate(selectedOrder._id, key)
                          }
                          className={`border-gaming-border ${
                            selectedOrder.status === key
                              ? `${config.color} border opacity-50 cursor-not-allowed`
                              : "text-gaming-text hover:bg-gaming-surfaceLight"
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 mr-1.5" />
                          {config.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
