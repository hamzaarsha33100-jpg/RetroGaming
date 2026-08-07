"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Boxes,
  Search,
  Loader2,
  AlertTriangle,
  PackageX,
  Plus,
  Minus,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface InventoryItem {
  _id: string;
  name: string;
  sku: string;
  barcode?: string;
  mainImage: string;
  stockQuantity: number;
  minStockLevel: number;
  maxStockLevel?: number;
  warehouseLocation?: string;
  lowStock: boolean;
  outOfStock: boolean;
  stockStatus: "out" | "low" | "ok";
  updatedAt: string;
}

interface InventoryResponse {
  data: InventoryItem[];
  pagination: { page: number; limit: number; total: number; pages: number };
  stats: {
    totalProducts: number;
    lowCount: number;
    outCount: number;
    lowStockThreshold: number;
  };
}

export default function InventoryClient() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [search, setSearch] = useState("");
  const [adjusting, setAdjusting] = useState<{ id: string; qty: number; note: string } | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<InventoryResponse>({
    queryKey: ["admin-inventory", page, status, search],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: "20", status, search });
      const res = await fetch(`/api/admin/inventory?${params}`);
      if (!res.ok) throw new Error("Failed to fetch inventory");
      return res.json();
    },
  });

  const adjustMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/admin/inventory", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: adjusting!.id,
          adjustment: adjusting!.qty,
          note: adjusting!.note,
        }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to update stock");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Stock updated");
      setAdjusting(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const handleExport = () => {
    if (!data?.data) return;
    const csv = [
      "Name,SKU,Barcode,Stock,Min Level,Max Level,Warehouse,Status,Updated",
      ...data.data.map((p) =>
        [
          `"${p.name.replace(/"/g, '""')}"`,
          p.sku,
          p.barcode || "",
          p.stockQuantity,
          p.minStockLevel,
          p.maxStockLevel ?? "",
          `"${(p.warehouseLocation || "").replace(/"/g, '""')}"`,
          p.stockStatus,
          new Date(p.updatedAt).toLocaleDateString(),
        ].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inventory.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const items = data?.data || [];
  const stats = data?.stats || { totalProducts: 0, lowCount: 0, outCount: 0, lowStockThreshold: 5 };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-gaming font-bold text-white flex items-center gap-3">
            <Boxes className="w-7 h-7 text-neon-cyan" />
            Inventory Management
          </h1>
          <p className="text-gaming-textMuted text-sm mt-1">
            Monitor stock levels, low-stock alerts, and warehouse information.
          </p>
        </div>
        <Button variant="outline" onClick={handleExport} className="gap-2">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div className="gaming-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <p className="text-2xl font-bold text-white">{stats.totalProducts}</p>
          <p className="text-gaming-textMuted text-xs mt-0.5">Total Products</p>
        </motion.div>
        <motion.div className="gaming-card p-5 border-neon-yellow/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-neon-yellow" />
            <p className="text-2xl font-bold text-white">{stats.lowCount}</p>
          </div>
          <p className="text-gaming-textMuted text-xs mt-0.5">Low Stock (≤ {stats.lowStockThreshold})</p>
        </motion.div>
        <motion.div className="gaming-card p-5 border-destructive/20" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-2">
            <PackageX className="w-4 h-4 text-destructive" />
            <p className="text-2xl font-bold text-white">{stats.outCount}</p>
          </div>
          <p className="text-gaming-textMuted text-xs mt-0.5">Out of Stock</p>
        </motion.div>
        <motion.div className="gaming-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <p className="text-2xl font-bold text-neon-cyan">{stats.lowStockThreshold}</p>
          <p className="text-gaming-textMuted text-xs mt-0.5">Global Alert Threshold</p>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="gaming-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by name, SKU, or barcode..."
            className="input-gaming w-full pl-10"
          />
        </div>
        <div className="flex rounded-lg border border-gaming-border overflow-hidden">
          {[
            ["all", "All"],
            ["low", "Low Stock"],
            ["out", "Out of Stock"],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => {
                setStatus(value);
                setPage(1);
              }}
              className={`px-4 py-2 text-xs font-medium transition-colors ${
                status === value ? "bg-neon-cyan/10 text-neon-cyan" : "text-gaming-textMuted hover:text-gaming-text"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="gaming-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-24">
            <Boxes className="w-16 h-16 text-gaming-border mx-auto mb-4" />
            <p className="text-gaming-textMuted">No products match your filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gaming-border">
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Product</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">SKU</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Stock</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Min/Max</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Warehouse</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Adjust</th>
                </tr>
              </thead>
              <tbody>
                {items.map((p) => (
                  <tr
                    key={p._id}
                    className={`border-b border-gaming-border hover:bg-white/5 transition-colors ${
                      p.outOfStock ? "bg-destructive/[0.03]" : p.lowStock ? "bg-neon-yellow/[0.03]" : ""
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.mainImage && (
                          <img src={p.mainImage} alt={p.name} className="w-9 h-9 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="text-gaming-text text-sm font-medium">{p.name}</p>
                          <p className="text-gaming-textMuted text-xs">{p.barcode || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gaming-textMuted text-sm font-mono">{p.sku}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-bold text-sm tabular-nums ${
                          p.outOfStock ? "text-destructive" : p.lowStock ? "text-neon-yellow" : "text-neon-green"
                        }`}
                      >
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gaming-textMuted text-sm">
                      {p.minStockLevel}
                      {p.maxStockLevel != null ? ` / ${p.maxStockLevel}` : ""}
                    </td>
                    <td className="px-4 py-3 text-gaming-textMuted text-sm">{p.warehouseLocation || "—"}</td>
                    <td className="px-4 py-3">
                      <Badge
                        className={
                          p.outOfStock
                            ? "bg-destructive/10 text-destructive border border-destructive/20"
                            : p.lowStock
                              ? "bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20"
                              : "bg-neon-green/10 text-neon-green border border-neon-green/20"
                        }
                      >
                        {p.outOfStock ? "Out of Stock" : p.lowStock ? "Low Stock" : "In Stock"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAdjusting({ id: p._id, qty: 0, note: "" })}
                          title="Adjust stock"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setAdjusting({ id: p._id, qty: 0, note: "" })}
                          title="Adjust stock"
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gaming-border">
            <p className="text-gaming-textMuted text-sm">
              Page {data.pagination.page} of {data.pagination.pages} ({data.pagination.total} products)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Adjust stock dialog */}
      {adjusting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setAdjusting(null)}>
          <div className="gaming-card w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-gaming font-semibold text-white mb-4">Adjust Stock</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gaming-textMuted mb-1">Quantity</label>
                <Input
                  type="number"
                  value={adjusting.qty}
                  onChange={(e) => setAdjusting({ ...adjusting, qty: Number(e.target.value) })}
                />
                <p className="text-xs text-gaming-textMuted mt-1">
                  Positive adds stock, negative removes stock.
                </p>
              </div>
              <div>
                <label className="block text-sm text-gaming-textMuted mb-1">Note (optional)</label>
                <Input
                  value={adjusting.note}
                  onChange={(e) => setAdjusting({ ...adjusting, note: e.target.value })}
                  placeholder="e.g. Received shipment"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  onClick={() => adjustMutation.mutate()}
                  disabled={adjustMutation.isPending || adjusting.qty === 0}
                >
                  {adjustMutation.isPending ? "Saving..." : "Apply Adjustment"}
                </Button>
                <Button variant="outline" onClick={() => setAdjusting(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
