"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Search, Users, Loader2, Trash2, Download, Upload, Send, Megaphone, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";

interface Subscriber {
  _id: string;
  email: string;
  name?: string;
  isActive: boolean;
  createdAt: string;
}

interface Campaign {
  _id: string;
  name: string;
  subject: string;
  template: string;
  status: string;
  totalRecipients: number;
  sentCount: number;
  failedCount: number;
  scheduledAt?: string;
  sentAt?: string;
  createdAt: string;
}

type Tab = "subscribers" | "campaigns";

export default function AdminNewsletterPage() {
  const [tab, setTab] = useState<Tab>("subscribers");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [importing, setImporting] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    name: "",
    subject: "",
    content: "",
    template: "promotional",
    sendNow: true,
  });

  useEffect(() => {
    fetchSubscribers();
    fetchCampaigns();
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

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/admin/newsletter/campaigns");
      const data = await res.json();
      if (data.success) {
        setCampaigns(data.data || []);
      }
    } catch {
      // ignore
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
    const csv = ["Email,Name,Status,Subscribed At", ...filtered.map((s) =>
      `${s.email},${s.name || ""},${s.isActive ? "Active" : "Inactive"},${new Date(s.createdAt).toLocaleDateString()}`
    )].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "newsletter-subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImporting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/newsletter/import", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        fetchSubscribers();
      } else {
        toast.error(data.error || "Import failed");
      }
    } catch {
      toast.error("Import failed");
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const handleSendCampaign = async () => {
    if (!campaignForm.name || !campaignForm.subject || !campaignForm.content) {
      toast.error("Name, subject, and content are required");
      return;
    }
    setSending(true);
    try {
      const res = await fetch("/api/admin/newsletter/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(campaignForm),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Campaign created and sent!");
        setCampaignOpen(false);
        setCampaignForm({ name: "", subject: "", content: "", template: "promotional", sendNow: true });
        fetchCampaigns();
      } else {
        toast.error(data.error || "Failed to send campaign");
      }
    } catch {
      toast.error("Failed to send campaign");
    } finally {
      setSending(false);
    }
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
        <div className="flex items-center gap-2">
          {tab === "subscribers" && (
            <>
              <label className="flex items-center gap-2 px-4 py-2 border border-gaming-border text-gaming-textMuted rounded-lg hover:border-neon-cyan/50 hover:text-neon-cyan transition-all text-sm cursor-pointer disabled:opacity-40">
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Import CSV
                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleImport} disabled={importing} />
              </label>
              <button
                onClick={handleExport}
                disabled={filtered.length === 0}
                className="flex items-center gap-2 px-4 py-2 border border-gaming-border text-gaming-textMuted rounded-lg hover:border-neon-cyan/50 hover:text-neon-cyan transition-all text-sm disabled:opacity-40"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={() => setCampaignOpen(true)}
                className="btn-primary flex items-center gap-2 text-sm"
              >
                <Send className="w-4 h-4" />
                New Campaign
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg border border-gaming-border overflow-hidden w-fit">
        <button
          onClick={() => setTab("subscribers")}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            tab === "subscribers" ? "bg-neon-cyan/10 text-neon-cyan" : "text-gaming-textMuted hover:text-gaming-text"
          }`}
        >
          Subscribers
        </button>
        <button
          onClick={() => setTab("campaigns")}
          className={`px-5 py-2.5 text-sm font-medium transition-colors ${
            tab === "campaigns" ? "bg-neon-cyan/10 text-neon-cyan" : "text-gaming-textMuted hover:text-gaming-text"
          }`}
        >
          Campaigns
        </button>
      </div>

      {tab === "subscribers" ? (
        <>
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
        </>
      ) : (
        <>
          {/* Campaigns */}
          <div className="grid grid-cols-1 gap-4">
            {campaigns.length === 0 ? (
              <div className="gaming-card text-center py-24">
                <Megaphone className="w-16 h-16 text-gaming-border mx-auto mb-4" />
                <p className="text-gaming-textMuted">No campaigns yet. Create your first promotional email.</p>
              </div>
            ) : (
              campaigns.map((c) => (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="gaming-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-gaming-text font-semibold">{c.name}</p>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                          c.status === "sent"
                            ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                            : c.status === "failed"
                              ? "bg-destructive/10 text-destructive border border-destructive/20"
                              : "bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20"
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                    <p className="text-gaming-textMuted text-sm mt-1">Subject: {c.subject}</p>
                    <p className="text-gaming-textMuted text-xs mt-1">
                      {c.sentCount} sent · {c.failedCount} failed · {c.totalRecipients} recipients
                      {c.sentAt ? ` · Sent ${formatDateTime(c.sentAt)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-neon-green" />
                      <span className="text-gaming-text text-sm">{c.sentCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="w-4 h-4 text-destructive" />
                      <span className="text-gaming-text text-sm">{c.failedCount}</span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}

      {/* Campaign dialog */}
      {campaignOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setCampaignOpen(false)}>
          <div className="gaming-card w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-gaming font-semibold text-white flex items-center gap-2 mb-4">
              <Send className="w-5 h-5 text-neon-cyan" />
              New Campaign
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gaming-textMuted mb-1">Campaign Name</label>
                <input
                  value={campaignForm.name}
                  onChange={(e) => setCampaignForm({ ...campaignForm, name: e.target.value })}
                  className="input-gaming w-full"
                  placeholder="e.g. Summer Sale Announcement"
                />
              </div>
              <div>
                <label className="block text-sm text-gaming-textMuted mb-1">Email Subject</label>
                <input
                  value={campaignForm.subject}
                  onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                  className="input-gaming w-full"
                  placeholder="e.g. 🔥 Summer Sale: Up to 40% Off!"
                />
              </div>
              <div>
                <label className="block text-sm text-gaming-textMuted mb-1">Content (HTML supported)</label>
                <textarea
                  value={campaignForm.content}
                  onChange={(e) => setCampaignForm({ ...campaignForm, content: e.target.value })}
                  className="input-gaming w-full min-h-[140px]"
                  placeholder="<p>Our biggest sale of the year is here!</p><a href='https://...'>Shop Now</a>"
                />
              </div>
              <div>
                <label className="block text-sm text-gaming-textMuted mb-1">Template Style</label>
                <select
                  value={campaignForm.template}
                  onChange={(e) => setCampaignForm({ ...campaignForm, template: e.target.value })}
                  className="input-gaming w-full"
                >
                  <option value="promotional">Promotional</option>
                  <option value="new_product">New Product</option>
                  <option value="flash_sale">Flash Sale</option>
                  <option value="offer">Offer</option>
                </select>
              </div>
              <label className="flex items-center justify-between p-4 rounded-lg bg-gaming-dark border border-gaming-border">
                <div>
                  <p className="text-gaming-text font-medium">Send immediately</p>
                  <p className="text-gaming-textMuted text-sm">Send to all active subscribers now</p>
                </div>
                <input
                  type="checkbox"
                  checked={campaignForm.sendNow}
                  onChange={(e) => setCampaignForm({ ...campaignForm, sendNow: e.target.checked })}
                  className="w-4 h-4 accent-neon-cyan"
                />
              </label>
              <div className="flex gap-2">
                <button
                  onClick={handleSendCampaign}
                  disabled={sending}
                  className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? "Sending..." : "Send Campaign"}
                </button>
                <button
                  onClick={() => setCampaignOpen(false)}
                  className="px-4 py-2 border border-gaming-border text-gaming-textMuted rounded-lg hover:border-neon-cyan/50 hover:text-neon-cyan transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
