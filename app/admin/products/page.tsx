"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Filter,
  Package,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface Product {
  _id: string;
  name: string;
  mainImage: string;
  brand: string;
  price: number;
  salePrice?: number;
  stockQuantity: number;
  isActive: boolean;
  isOutOfStock: boolean;
  isFeatured: boolean;
  category: { name: string } | string;
  sku: string;
  createdAt: string;
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        ...(search && { search }),
      });
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setTotal(data.pagination.total);
        setPages(data.pagination.pages);
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

    setDeleting(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Product deleted");
        setProducts((prev) => prev.filter((p) => p._id !== id));
        setTotal((t) => t - 1);
      } else {
        toast.error(data.error);
      }
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-gaming font-bold text-white">
            Products{" "}
            <span className="text-gaming-textMuted font-normal text-lg">
              ({total})
            </span>
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </Link>
      </div>

      {/* Filters */}
      <div className="gaming-card p-4 flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search products..."
            className="input-gaming w-full pl-10"
          />
        </div>
        <button className="px-4 py-2 border border-gaming-border text-gaming-textMuted rounded-lg hover:border-neon-cyan/50 hover:text-neon-cyan transition-all flex items-center gap-2">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Table */}
      <div className="gaming-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24">
            <Package className="w-16 h-16 text-gaming-border mx-auto mb-4" />
            <p className="text-gaming-textMuted">
              No products found.{" "}
              <Link href="/admin/products/new" className="text-neon-cyan hover:underline">
                Add your first product
              </Link>
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gaming-border">
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">
                    Product
                  </th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">
                    Price
                  </th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">
                    Stock
                  </th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <motion.tr
                    key={product._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gaming-border hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.mainImage}
                          alt={product.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gaming-dark"
                        />
                        <div>
                          <p className="text-gaming-text font-medium text-sm">
                            {product.name}
                          </p>
                          <p className="text-gaming-textMuted text-xs">
                            {product.brand} ·{" "}
                            {typeof product.category === "object"
                              ? product.category.name
                              : ""}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gaming-textMuted text-sm font-mono">
                      {product.sku}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <p className="text-neon-cyan font-semibold text-sm">
                          {formatPrice(product.salePrice ?? product.price)}
                        </p>
                        {product.salePrice && (
                          <p className="text-gaming-textMuted text-xs line-through">
                            {formatPrice(product.price)}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`text-sm font-medium ${
                          product.isOutOfStock
                            ? "text-destructive"
                            : "text-neon-green"
                        }`}
                      >
                        {product.isOutOfStock
                          ? "Out of Stock"
                          : `${product.stockQuantity} units`}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          product.isActive
                            ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                            : "bg-gaming-border/20 text-gaming-textMuted border border-gaming-border"
                        }`}
                      >
                        {product.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/products/${product._id}`}
                          target="_blank"
                          className="p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors rounded-lg hover:bg-white/5"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className="p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors rounded-lg hover:bg-white/5"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() =>
                            handleDelete(product._id, product.name)
                          }
                          disabled={deleting === product._id}
                          className="p-2 text-gaming-textMuted hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === product._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gaming-border text-gaming-textMuted rounded-lg hover:border-neon-cyan/50 disabled:opacity-30 transition-all text-sm"
          >
            Previous
          </button>
          <span className="text-gaming-textMuted text-sm">
            Page {page} of {pages}
          </span>
          <button
            onClick={() => setPage(Math.min(pages, page + 1))}
            disabled={page === pages}
            className="px-4 py-2 border border-gaming-border text-gaming-textMuted rounded-lg hover:border-neon-cyan/50 disabled:opacity-30 transition-all text-sm"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
