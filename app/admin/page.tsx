"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  PackageX,
  Clock,
  Wallet,
  Mail,
  Zap,
  Tag,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import Link from "next/link";
import { formatPrice, formatDateTime } from "@/lib/utils";

interface DashboardData {
  stats: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    totalProducts: number;
    revenueChange: number;
    ordersChange: number;
    customersChange: number;
    productsChange: number;
  };
  recentOrders: Array<{
    _id: string;
    orderId: string;
    user: { name: string; email: string };
    total: number;
    status: string;
    createdAt: string;
  }>;
  orderStatusStats: Array<{ _id: string; count: number }>;
  topProducts: Array<{
    _id: string;
    name: string;
    image: string;
    totalSold: number;
    revenue: number;
  }>;
  revenueByMonth: Array<{
    _id: { year: number; month: number };
    revenue: number;
    orders: number;
  }>;
  alerts?: {
    lowStockCount: number;
    outOfStockCount: number;
    pendingOrdersCount: number;
    failedPaymentsCount: number;
    newSubscribers: number;
    endingSoonCount: number;
    expiredDiscountsCount: number;
  };
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const STATUS_COLORS: Record<string, string> = {
  pending: "#ffe600",
  processing: "#00fff5",
  shipped: "#9b59b6",
  delivered: "#39ff14",
  cancelled: "#ff006e",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-2 border-neon-cyan/30 border-t-neon-cyan rounded-full animate-spin" />
      </div>
    );
  }

  const stats = [
    {
      label: "Total Revenue",
      value: formatPrice(data?.stats.totalRevenue || 0),
      change: data?.stats.revenueChange || 0,
      icon: DollarSign,
      color: "text-neon-cyan",
      bg: "bg-neon-cyan/10",
    },
    {
      label: "Total Orders",
      value: (data?.stats.totalOrders || 0).toLocaleString(),
      change: data?.stats.ordersChange || 0,
      icon: ShoppingBag,
      color: "text-neon-purple",
      bg: "bg-neon-purple/10",
    },
    {
      label: "Customers",
      value: (data?.stats.totalCustomers || 0).toLocaleString(),
      change: data?.stats.customersChange || 0,
      icon: Users,
      color: "text-neon-pink",
      bg: "bg-neon-pink/10",
    },
    {
      label: "Products",
      value: (data?.stats.totalProducts || 0).toLocaleString(),
      change: data?.stats.productsChange || 0,
      icon: Package,
      color: "text-neon-yellow",
      bg: "bg-neon-yellow/10",
    },
  ];

  const chartData = (data?.revenueByMonth || []).map((item) => ({
    month: MONTHS[item._id.month - 1],
    revenue: item.revenue,
    orders: item.orders,
  }));

  const pieData = (data?.orderStatusStats || []).map((item) => ({
    name: item._id,
    value: item.count,
    color: STATUS_COLORS[item._id] || "#8888aa",
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-gaming font-bold text-white">
            Dashboard{" "}
            <span className="text-gradient">Overview</span>
          </h1>
          <p className="text-gaming-textMuted text-sm mt-1">
            Welcome back! Here&apos;s what&apos;s happening today.
          </p>
        </div>
      </div>

      {/* Alerts */}
      {(() => {
        const alerts = data?.alerts;
        if (!alerts) return null;
        const alertItems = [
          { count: alerts.lowStockCount, label: "Low Stock", href: "/admin/inventory?status=low", icon: AlertTriangle, color: "text-neon-yellow", bg: "bg-neon-yellow/10", show: alerts.lowStockCount > 0 },
          { count: alerts.outOfStockCount, label: "Out of Stock", href: "/admin/inventory?status=out", icon: PackageX, color: "text-destructive", bg: "bg-destructive/10", show: alerts.outOfStockCount > 0 },
          { count: alerts.pendingOrdersCount, label: "Pending Orders", href: "/admin/orders?status=pending", icon: Clock, color: "text-neon-cyan", bg: "bg-neon-cyan/10", show: alerts.pendingOrdersCount > 0 },
          { count: alerts.failedPaymentsCount, label: "Failed Payments", href: "/admin/orders", icon: Wallet, color: "text-neon-pink", bg: "bg-neon-pink/10", show: alerts.failedPaymentsCount > 0 },
          { count: alerts.newSubscribers, label: "New Subscribers", href: "/admin/newsletter", icon: Mail, color: "text-neon-green", bg: "bg-neon-green/10", show: alerts.newSubscribers > 0 },
          { count: alerts.endingSoonCount, label: "Sales Ending Soon", href: "/admin/countdowns", icon: Zap, color: "text-neon-pink", bg: "bg-neon-pink/10", show: alerts.endingSoonCount > 0 },
          { count: alerts.expiredDiscountsCount, label: "Expired Discounts", href: "/admin/coupons", icon: Tag, color: "text-neon-yellow", bg: "bg-neon-yellow/10", show: alerts.expiredDiscountsCount > 0 },
        ].filter((a) => a.show);

        if (alertItems.length === 0) return null;

        return (
          <div className="gaming-card p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-neon-pink/10">
                <AlertCircle className="w-5 h-5 text-neon-pink" />
              </div>
              <h2 className="text-lg font-gaming font-semibold text-white">Attention Required</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
              {alertItems.map((alert) => (
                <Link
                  key={alert.label}
                  href={alert.href}
                  className="flex items-center gap-3 p-3 rounded-lg border border-gaming-border hover:border-neon-cyan/30 transition-colors group"
                >
                  <div className={`p-2 rounded-lg ${alert.bg}`}>
                    <alert.icon className={`w-4 h-4 ${alert.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-white leading-none">{alert.count}</p>
                    <p className="text-gaming-textMuted text-xs mt-1">{alert.label}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="gaming-card p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div
                className={`flex items-center gap-1 text-xs font-medium ${
                  stat.change >= 0 ? "text-neon-green" : "text-destructive"
                }`}
              >
                {stat.change >= 0 ? (
                  <TrendingUp className="w-3.5 h-3.5" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5" />
                )}
                {Math.abs(stat.change).toFixed(1)}%
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{stat.value}</p>
            <p className="text-gaming-textMuted text-sm mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <div className="xl:col-span-2 gaming-card p-6">
          <h2 className="text-lg font-gaming font-semibold text-white mb-6">
            Revenue Overview
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00fff5" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#00fff5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e1e3f" />
              <XAxis dataKey="month" stroke="#8888aa" fontSize={12} />
              <YAxis stroke="#8888aa" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "#0f0f1a",
                  border: "1px solid #1e1e3f",
                  borderRadius: "8px",
                  color: "#e0e0ff",
                }}
                formatter={(value) => [formatPrice(Number(value ?? 0)), "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#00fff5"
                fill="url(#revenueGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="gaming-card p-6">
          <h2 className="text-lg font-gaming font-semibold text-white mb-6">
            Order Status
          </h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#0f0f1a",
                      border: "1px solid #1e1e3f",
                      color: "#e0e0ff",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-4">
                {pieData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-gaming-textMuted capitalize">
                        {item.name}
                      </span>
                    </div>
                    <span className="text-gaming-text font-medium">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gaming-textMuted">
              <AlertCircle className="w-8 h-8 mb-2" />
              <p className="text-sm">No order data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Orders & Top Products */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="gaming-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-gaming font-semibold text-white">
              Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-neon-cyan text-sm flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.recentOrders || []).length === 0 ? (
              <p className="text-gaming-textMuted text-sm text-center py-8">
                No orders yet
              </p>
            ) : (
              data?.recentOrders.map((order) => (
                <Link
                  key={order._id}
                  href={`/admin/orders`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <div>
                    <p className="text-gaming-text text-sm font-medium">
                      #{order.orderId}
                    </p>
                    <p className="text-gaming-textMuted text-xs">
                      {order.user?.name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-neon-cyan font-semibold text-sm">
                      {formatPrice(order.total)}
                    </p>
                    <span
                      className={`text-xs capitalize px-2 py-0.5 rounded-full`}
                      style={{
                        backgroundColor:
                          STATUS_COLORS[order.status] + "20",
                        color: STATUS_COLORS[order.status],
                        border: `1px solid ${STATUS_COLORS[order.status]}40`,
                      }}
                    >
                      {order.status}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="gaming-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-gaming font-semibold text-white">
              Top Products
            </h2>
            <Link
              href="/admin/products"
              className="text-neon-cyan text-sm flex items-center gap-1 hover:underline"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(data?.topProducts || []).length === 0 ? (
              <p className="text-gaming-textMuted text-sm text-center py-8">
                No sales data yet
              </p>
            ) : (
              data?.topProducts.map((product, index) => (
                <div
                  key={product._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <span className="text-gaming-textMuted text-sm font-bold w-5">
                    {index + 1}
                  </span>
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-gaming-text text-sm font-medium truncate">
                      {product.name}
                    </p>
                    <p className="text-gaming-textMuted text-xs">
                      {product.totalSold} sold
                    </p>
                  </div>
                  <span className="text-neon-cyan font-semibold text-sm">
                    {formatPrice(product.revenue)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
