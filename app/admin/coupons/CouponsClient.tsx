"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Tag, Copy, Check } from "lucide-react";
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

const couponSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters").toUpperCase(),
  description: z.string().optional(),
  discountType: z.enum(["percentage", "fixed"]),
  discountValue: z.number().min(0, "Value must be positive"),
  minOrderAmount: z.number().min(0).optional(),
  maxDiscount: z.number().min(0).optional(),
  usageLimit: z.number().min(1).optional(),
  expiresAt: z.string().optional(),
  isActive: z.boolean(),
});

type CouponFormData = z.infer<typeof couponSchema>;

interface Coupon extends CouponFormData {
  _id: string;
  usedCount: number;
  createdAt: string;
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function CouponsClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [deletingCoupon, setDeletingCoupon] = useState<Coupon | null>(null);
  const [copiedCode, setCopiedCode] = useState("");

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CouponFormData>({
    resolver: zodResolver(couponSchema),
    defaultValues: {
      discountType: "percentage",
      isActive: true,
    },
  });

  const { data: coupons = [], isLoading } = useQuery<Coupon[]>({
    queryKey: ["admin-coupons"],
    queryFn: async () => {
      const res = await fetch("/api/admin/coupons");
      if (!res.ok) throw new Error("Failed to fetch coupons");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CouponFormData) => {
      const res = await fetch("/api/admin/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to create coupon");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon created successfully!");
      setIsCreateOpen(false);
      reset();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CouponFormData> }) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update coupon");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon updated successfully!");
      setEditingCoupon(null);
      reset();
    },
    onError: () => {
      toast.error("Failed to update coupon");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/coupons/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete coupon");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-coupons"] });
      toast.success("Coupon deleted successfully!");
      setDeletingCoupon(null);
    },
    onError: () => {
      toast.error("Failed to delete coupon");
    },
  });

  const onSubmit = (data: CouponFormData) => {
    if (editingCoupon) {
      updateMutation.mutate({ id: editingCoupon._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    Object.keys(coupon).forEach((key) => {
      setValue(key as any, coupon[key as keyof Coupon] as any);
    });
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const discountType = watch("discountType");

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-slate-900/50 rounded-2xl p-6 animate-pulse">
            <div className="h-6 bg-slate-800 rounded mb-4" />
            <div className="h-4 bg-slate-800 rounded mb-2" />
            <div className="h-4 bg-slate-800 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Action */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setIsCreateOpen(true);
            reset();
          }}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Coupon
        </Button>
      </div>

      {/* Coupons Grid */}
      {coupons.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-12 text-center">
          <Tag className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Coupons</h3>
          <p className="text-gray-400 mb-6">Create your first discount coupon</p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Coupon
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coupons.map((coupon, index) => (
            <motion.div
              key={coupon._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 hover:border-purple-500/40 transition"
            >
              {/* Code */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Tag className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white text-lg">{coupon.code}</h3>
                </div>
                <button
                  onClick={() => copyCode(coupon.code)}
                  className="p-2 hover:bg-slate-800 rounded-lg transition"
                >
                  {copiedCode === coupon.code ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Description */}
              {coupon.description && (
                <p className="text-gray-400 text-sm mb-4">{coupon.description}</p>
              )}

              {/* Discount Value */}
              <div className="mb-4">
                <div className="text-3xl font-bold text-purple-400">
                  {coupon.discountType === "percentage"
                    ? `${coupon.discountValue}% OFF`
                    : `$${coupon.discountValue} OFF`}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-2 mb-4 text-sm">
                {coupon.minOrderAmount && (
                  <div className="flex justify-between text-gray-400">
                    <span>Min Order:</span>
                    <span className="text-white">${coupon.minOrderAmount}</span>
                  </div>
                )}
                {coupon.usageLimit && (
                  <div className="flex justify-between text-gray-400">
                    <span>Usage:</span>
                    <span className="text-white">
                      {coupon.usedCount} / {coupon.usageLimit}
                    </span>
                  </div>
                )}
                {coupon.expiresAt && (
                  <div className="flex justify-between text-gray-400">
                    <span>Expires:</span>
                    <span className="text-white">{formatDate(coupon.expiresAt)}</span>
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center justify-between mb-4">
                <Badge
                  className={`${
                    coupon.isActive
                      ? "bg-green-500/10 text-green-500"
                      : "bg-gray-500/10 text-gray-500"
                  }`}
                >
                  {coupon.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={() => openEditDialog(coupon)}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-purple-500/20"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => setDeletingCoupon(coupon)}
                  variant="outline"
                  size="sm"
                  className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingCoupon}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingCoupon(null);
            reset();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-slate-900 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCoupon ? "Edit Coupon" : "Create Coupon"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Code */}
              <div>
                <Label htmlFor="code" className="text-gray-300">
                  Coupon Code *
                </Label>
                <Input
                  id="code"
                  {...register("code")}
                  placeholder="SAVE20"
                  className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white uppercase"
                />
                {errors.code && (
                  <p className="text-red-400 text-sm mt-1">{errors.code.message}</p>
                )}
              </div>

              {/* Discount Type */}
              <div>
                <Label htmlFor="discountType" className="text-gray-300">
                  Discount Type *
                </Label>
                <Select
                  value={discountType}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setValue("discountType", value)
                  }
                >
                  <SelectTrigger className="mt-1.5 bg-slate-800/50 border-purple-500/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-purple-500/20">
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Value */}
              <div>
                <Label htmlFor="discountValue" className="text-gray-300">
                  {discountType === "percentage" ? "Percentage (%)" : "Amount ($)"} *
                </Label>
                <Input
                  id="discountValue"
                  type="number"
                  step="0.01"
                  {...register("discountValue", { valueAsNumber: true })}
                  placeholder={discountType === "percentage" ? "20" : "50"}
                  className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
                />
                {errors.discountValue && (
                  <p className="text-red-400 text-sm mt-1">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>

              {/* Min Order Amount */}
              <div>
                <Label htmlFor="minOrderAmount" className="text-gray-300">
                  Min Order Amount ($)
                </Label>
                <Input
                  id="minOrderAmount"
                  type="number"
                  step="0.01"
                  {...register("minOrderAmount", { valueAsNumber: true })}
                  placeholder="50"
                  className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
                />
              </div>

              {/* Max Discount (for percentage) */}
              {discountType === "percentage" && (
                <div>
                  <Label htmlFor="maxDiscount" className="text-gray-300">
                    Max Discount ($)
                  </Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    step="0.01"
                    {...register("maxDiscount", { valueAsNumber: true })}
                    placeholder="100"
                    className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
                  />
                </div>
              )}

              {/* Usage Limit */}
              <div>
                <Label htmlFor="usageLimit" className="text-gray-300">
                  Usage Limit
                </Label>
                <Input
                  id="usageLimit"
                  type="number"
                  {...register("usageLimit", { valueAsNumber: true })}
                  placeholder="100"
                  className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
                />
              </div>

              {/* Expires At */}
              <div>
                <Label htmlFor="expiresAt" className="text-gray-300">
                  Expiry Date
                </Label>
                <Input
                  id="expiresAt"
                  type="date"
                  {...register("expiresAt")}
                  className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Brief description of this coupon..."
                rows={2}
                className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
              />
            </div>

            {/* Active Status */}
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive" className="text-gray-300">
                Active Status
              </Label>
              <Switch
                id="isActive"
                checked={watch("isActive")}
                onCheckedChange={(checked) => setValue("isActive", checked)}
              />
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCoupon(null);
                  reset();
                }}
                variant="outline"
                className="border-purple-500/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {editingCoupon ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCoupon}
        onOpenChange={() => setDeletingCoupon(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-purple-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Coupon</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete coupon "{deletingCoupon?.code}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-purple-500/20">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingCoupon && deleteMutation.mutate(deletingCoupon._id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
