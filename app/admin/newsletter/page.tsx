"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Search, Users, Loader2, Trash2, Download } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";

interface Subscriber {
  _id: string;
  email: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/newsletter");
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.data || []);
      }
    } catch {
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`Remove "${email}" from newsletter? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/newsletter?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Subscriber removed");
        setSubscribers((prev) => prev.filter((s) => s._id !== id));
      } else {
        toast.error(data.error || "Failed to remove subscriber");
      }
    } catch {
      toast.error("Failed to remove subscriber");
    } finally {
      setDeleting(null);
    }
  };

  const handleExport = () => {
    const csv = ["Email,Status,Subscribed At", ...filtered.map((s) =>
      `${s.email},${s.isActive ? "Active" : "Inactive"},${new Date(s.createdAt).toLocaleDateString()}`
    )].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = subscribers.filter((s) =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-gaming font-bold text-white">
            Newsletter{" "}
            <span className="text-gaming-textMuted font-normal text-lg">
              ({subscribers.length} subscribers)
            </span>
          </h1>
        </div>
        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="flex items-center gap-2 px-4 py-2 border border-gaming-border text-gaming-textMuted rounded-lg hover:border-neon-cyan/50 hover:text-neon-cyan transition-all text-sm disabled:opacity-40"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gaming-card p-6 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-neon-cyan/10">
            <Users className="w-6 h-6 text-neon-cyan" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">{subscribers.length}</p>
            <p className="text-gaming-textMuted text-sm">Total Subscribers</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="gaming-card p-6 flex items-center gap-4"
        >
          <div className="p-3 rounded-xl bg-neon-green/10">
            <Mail className="w-6 h-6 text-neon-green" />
          </div>
          <div>
            <p className="text-2xl font-bold text-white">
              {subscribers.filter((s) => s.isActive).length}
            </p>
            <p className="text-gaming-textMuted text-sm">Active Subscribers</p>
          </div>
        </motion.div>
      </div>

      {/* Search */}
      <div className="gaming-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search subscribers..."
            className="input-gaming w-full pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="gaming-card overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <Mail className="w-16 h-16 text-gaming-border mx-auto mb-4" />
            <p className="text-gaming-textMuted">
              {search ? "No subscribers match your search." : "No subscribers yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gaming-border">
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Email</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Subscribed</th>
                  <th className="text-right px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((subscriber) => (
                  <motion.tr
                    key={subscriber._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-gaming-border hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 py-4 text-gaming-text text-sm">{subscriber.email}</td>
                    <td className="px-4 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          subscriber.isActive
                            ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                            : "bg-gaming-border/20 text-gaming-textMuted border border-gaming-border"
                        }`}
                      >
                        {subscriber.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gaming-textMuted text-sm">
                      {formatDateTime(subscriber.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => handleDelete(subscriber._id, subscriber.email)}
                          disabled={deleting === subscriber._id}
                          className="p-2 text-gaming-textMuted hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10 disabled:opacity-50"
                          title="Remove"
                        >
                          {deleting === subscriber._id ? (
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
    </div>
  );
}
