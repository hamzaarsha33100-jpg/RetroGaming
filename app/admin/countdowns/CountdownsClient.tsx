"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Timer,
  Plus,
  Edit,
  Trash2,
  Power,
  Loader2,
  Zap,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface CountdownTimer {
  _id: string;
  name: string;
  description?: string;
  target: string;
  placement: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isEnded: boolean;
  discountType?: string;
  discountValue?: number;
  bannerText?: string;
  displayOn?: {
    homepage: boolean;
    productIds?: string[];
    categoryIds?: string[];
    bannerIds?: string[];
  };
  endAction?: {
    removeDiscount: boolean;
    setOutOfStock: boolean;
  };
}

const TARGET_LABELS: Record<string, string> = {
  flash_sale: "Flash Sale",
  limited_offer: "Limited-Time Offer",
  product_launch: "Product Launch",
  seasonal_discount: "Seasonal Discount",
  special_promotion: "Special Promotion",
};

const PLACEMENT_LABELS: Record<string, string> = {
  homepage: "Homepage",
  product: "Product",
  category: "Category",
  banner: "Banner",
};

function formatDate(iso: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function CountdownsClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<CountdownTimer | null>(null);
  const [deleting, setDeleting] = useState<CountdownTimer | null>(null);
  const [expiring, setExpiring] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    name: "",
    description: "",
    target: "flash_sale",
    placement: "homepage",
    startDate: "",
    endDate: "",
    discountType: "percentage",
    discountValue: "",
    homepage: true,
    removeDiscount: true,
    setOutOfStock: false,
    isActive: true,
  });

  const { data: timers = [], isLoading } = useQuery<CountdownTimer[]>({
    queryKey: ["admin-countdowns"],
    queryFn: async () => {
      const res = await fetch("/api/admin/countdowns");
      if (!res.ok) throw new Error("Failed to fetch timers");
      return res.json();
    },
  });

  const openCreate = () => {
    setForm({
      name: "",
      description: "",
      target: "flash_sale",
      placement: "homepage",
      startDate: new Date().toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString().slice(0, 16),
      discountType: "percentage",
      discountValue: "",
      homepage: true,
      removeDiscount: true,
      setOutOfStock: false,
      isActive: true,
    });
    setIsCreateOpen(true);
  };

  const openEdit = (t: CountdownTimer) => {
    setEditing(t);
    setForm({
      name: t.name,
      description: t.description || "",
      target: t.target,
      placement: t.placement,
      startDate: t.startDate?.slice(0, 16) || "",
      endDate: t.endDate?.slice(0, 16) || "",
      discountType: t.discountType || "percentage",
      discountValue: t.discountValue != null ? String(t.discountValue) : "",
      homepage: t.displayOn?.homepage ?? true,
      removeDiscount: t.endAction?.removeDiscount ?? true,
      setOutOfStock: t.endAction?.setOutOfStock ?? false,
      isActive: t.isActive,
    });
  };

  const buildPayload = () => ({
    name: form.name,
    description: form.description,
    target: form.target,
    placement: form.placement,
    startDate: new Date(form.startDate).toISOString(),
    endDate: new Date(form.endDate).toISOString(),
    discountType: form.discountType,
    discountValue: form.discountValue ? Number(form.discountValue) : undefined,
    displayOn: { homepage: form.homepage },
    endAction: {
      removeDiscount: form.removeDiscount,
      setOutOfStock: form.setOutOfStock,
    },
    isActive: form.isActive,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(
        editing ? `/api/admin/countdowns/${editing._id}` : "/api/admin/countdowns",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildPayload()),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save timer");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-countdowns"] });
      toast.success(editing ? "Timer updated" : "Timer created");
      setIsCreateOpen(false);
      setEditing(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/admin/countdowns/${deleting!._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete timer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-countdowns"] });
      toast.success("Timer deleted");
      setDeleting(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const toggleMutation = useMutation({
    mutationFn: async (t: CountdownTimer) => {
      const res = await fetch(`/api/admin/countdowns/${t._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...t,
          isActive: !t.isActive,
          startDate: t.startDate,
          endDate: t.endDate,
          displayOn: t.displayOn,
          endAction: t.endAction,
        }),
      });
      if (!res.ok) throw new Error("Failed to toggle timer");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-countdowns"] });
      toast.success("Timer updated");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const expireMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/countdowns/${id}`, { method: "POST" });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to expire timer");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-countdowns"] });
      toast.success("Timer expired — end actions applied");
      setExpiring(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const now = Date.now();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-gaming font-bold text-white flex items-center gap-3">
            <Timer className="w-7 h-7 text-neon-cyan" />
            Countdown Timers
          </h1>
          <p className="text-gaming-textMuted text-sm mt-1">
            Create, manage, and expire countdown timers for sales and promotions.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New Timer
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div className="gaming-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon-cyan/10">
              <Zap className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{timers.length}</p>
              <p className="text-gaming-textMuted text-xs">Total Timers</p>
            </div>
          </div>
        </motion.div>
        <motion.div className="gaming-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon-green/10">
              <Power className="w-5 h-5 text-neon-green" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {timers.filter((t) => t.isActive && !t.isEnded).length}
              </p>
              <p className="text-gaming-textMuted text-xs">Active Timers</p>
            </div>
          </div>
        </motion.div>
        <motion.div className="gaming-card p-5" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-neon-pink/10">
              <Clock className="w-5 h-5 text-neon-pink" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {timers.filter((t) => t.isEnded).length}
              </p>
              <p className="text-gaming-textMuted text-xs">Ended Timers</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="gaming-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
          </div>
        ) : timers.length === 0 ? (
          <div className="text-center py-24">
            <Timer className="w-16 h-16 text-gaming-border mx-auto mb-4" />
            <p className="text-gaming-textMuted">No countdown timers yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gaming-border">
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Type</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Ends</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-right px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {timers.map((t) => {
                  const ended = t.isEnded || new Date(t.endDate).getTime() <= now;
                  const isLive = t.isActive && !ended;
                  return (
                    <tr key={t._id} className="border-b border-gaming-border hover:bg-white/5 transition-colors">
                      <td className="px-4 py-4">
                        <p className="text-gaming-text text-sm font-medium">{t.name}</p>
                        <p className="text-gaming-textMuted text-xs">{TARGET_LABELS[t.target] || t.target}</p>
                      </td>
                      <td className="px-4 py-4 text-gaming-textMuted text-sm">
                        {PLACEMENT_LABELS[t.placement] || t.placement}
                        {t.discountValue ? (
                          <span className="ml-2 px-2 py-0.5 rounded-full bg-neon-pink/10 text-neon-pink text-xs border border-neon-pink/20">
                            {t.discountType === "percentage" ? `${t.discountValue}% off` : `$${t.discountValue} off`}
                          </span>
                        ) : null}
                      </td>
                      <td className="px-4 py-4 text-gaming-textMuted text-sm">
                        {formatDate(t.endDate)}
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={ended ? "secondary" : isLive ? "default" : "outline"}
                          className={
                            isLive
                              ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                              : ended
                                ? "bg-gaming-border/20 text-gaming-textMuted border border-gaming-border"
                                : "bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/20"
                          }
                        >
                          {ended ? "Ended" : isLive ? "Live" : "Scheduled"}
                        </Badge>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => toggleMutation.mutate(t)}
                            disabled={ended}
                            title={t.isActive ? "Disable" : "Enable"}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => openEdit(t)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          {!ended && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                setExpiring(t._id);
                                expireMutation.mutate(t._id);
                              }}
                              disabled={expiring === t._id}
                              title="Expire now"
                            >
                              <Zap className="w-4 h-4" />
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" onClick={() => setDeleting(t)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Timer" : "Create Countdown Timer"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Timer Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Summer Flash Sale"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sale Type</Label>
                <Select value={form.target} onValueChange={(v) => setForm({ ...form, target: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flash_sale">Flash Sale</SelectItem>
                    <SelectItem value="limited_offer">Limited-Time Offer</SelectItem>
                    <SelectItem value="product_launch">Product Launch</SelectItem>
                    <SelectItem value="seasonal_discount">Seasonal Discount</SelectItem>
                    <SelectItem value="special_promotion">Special Promotion</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Placement</Label>
                <Select value={form.placement} onValueChange={(v) => setForm({ ...form, placement: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="homepage">Homepage</SelectItem>
                    <SelectItem value="product">Product</SelectItem>
                    <SelectItem value="category">Category</SelectItem>
                    <SelectItem value="banner">Banner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Input
                  type="datetime-local"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label>End Date</Label>
                <Input
                  type="datetime-local"
                  value={form.endDate}
                  onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Discount Type</Label>
                <Select value={form.discountType} onValueChange={(v) => setForm({ ...form, discountType: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Discount Value</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.discountValue}
                  onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                  placeholder={form.discountType === "percentage" ? "e.g. 20" : "e.g. 10"}
                />
              </div>
            </div>
            <div className="space-y-3 rounded-lg border border-gaming-border p-4">
              <p className="text-sm font-medium text-white">When timer expires</p>
              <label className="flex items-center justify-between gap-4">
                <span className="text-sm text-gaming-textMuted">Remove product discount</span>
                <Switch
                  checked={form.removeDiscount}
                  onCheckedChange={(v) => setForm({ ...form, removeDiscount: v })}
                />
              </label>
              <label className="flex items-center justify-between gap-4">
                <span className="text-sm text-gaming-textMuted">Mark products out of stock</span>
                <Switch
                  checked={form.setOutOfStock}
                  onCheckedChange={(v) => setForm({ ...form, setOutOfStock: v })}
                />
              </label>
            </div>
            <label className="flex items-center justify-between gap-4 rounded-lg border border-gaming-border p-4">
              <span className="text-sm text-gaming-textMuted">Show on homepage</span>
              <Switch
                checked={form.homepage}
                onCheckedChange={(v) => setForm({ ...form, homepage: v })}
              />
            </label>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.name || !form.endDate}
              className="w-full"
            >
              {saveMutation.isPending ? "Saving..." : editing ? "Save Changes" : "Create Timer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete timer?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.name}" will be permanently removed. End actions will not be applied.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate()}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
