"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, Image as ImageIcon, MoveUp, MoveDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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

const bannerSchema = z.object({
  title: z.string().min(3, "Title is required"),
  subtitle: z.string().optional(),
  image: z.string().url("Valid image URL required"),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  isActive: z.boolean(),
});

type BannerFormData = z.infer<typeof bannerSchema>;

interface Banner extends BannerFormData {
  _id: string;
  order: number;
  createdAt: string;
}

export default function BannersClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BannerFormData>({
    resolver: zodResolver(bannerSchema),
    defaultValues: {
      isActive: true,
    },
  });

  const { data: banners = [], isLoading } = useQuery<Banner[]>({
    queryKey: ["admin-banners"],
    queryFn: async () => {
      const res = await fetch("/api/admin/banners");
      if (!res.ok) throw new Error("Failed to fetch banners");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: BannerFormData) => {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create banner");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner created successfully!");
      setIsCreateOpen(false);
      reset();
    },
    onError: () => {
      toast.error("Failed to create banner");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BannerFormData> }) => {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update banner");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner updated successfully!");
      setEditingBanner(null);
      reset();
    },
    onError: () => {
      toast.error("Failed to update banner");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete banner");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Banner deleted successfully!");
      setDeletingBanner(null);
    },
    onError: () => {
      toast.error("Failed to delete banner");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const res = await fetch(`/api/admin/banners/${id}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      if (!res.ok) throw new Error("Failed to reorder banner");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
    },
  });

  const onSubmit = (data: BannerFormData) => {
    if (editingBanner) {
      updateMutation.mutate({ id: editingBanner._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (banner: Banner) => {
    setEditingBanner(banner);
    Object.keys(banner).forEach((key) => {
      setValue(key as any, banner[key as keyof Banner] as any);
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-slate-900/50 rounded-2xl p-6 animate-pulse">
            <div className="h-48 bg-slate-800 rounded mb-4" />
            <div className="h-6 bg-slate-800 rounded w-1/3" />
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
          Add Banner
        </Button>
      </div>

      {/* Banners List */}
      {banners.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-12 text-center">
          <ImageIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Banners</h3>
          <p className="text-gray-400 mb-6">Create your first homepage banner</p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Banner
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {banners.map((banner, index) => (
            <motion.div
              key={banner._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/40 transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                {/* Image Preview */}
                <div className="relative h-48 md:col-span-1 rounded-lg overflow-hidden">
                  <img
                    src={banner.image}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                  />
                  <Badge
                    className={`absolute top-2 right-2 ${
                      banner.isActive
                        ? "bg-green-500/90 text-white"
                        : "bg-gray-500/90 text-white"
                    }`}
                  >
                    {banner.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Content */}
                <div className="md:col-span-2 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {banner.title}
                    </h3>
                    {banner.subtitle && (
                      <p className="text-gray-400 mb-3">{banner.subtitle}</p>
                    )}
                    {banner.ctaText && (
                      <div className="flex items-center gap-2 mb-4">
                        <Badge className="bg-purple-500/20 text-purple-300">
                          CTA: {banner.ctaText}
                        </Badge>
                        {banner.ctaLink && (
                          <span className="text-sm text-gray-500">→ {banner.ctaLink}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <div className="flex gap-1">
                      <Button
                        onClick={() => reorderMutation.mutate({ id: banner._id, direction: "up" })}
                        disabled={index === 0}
                        size="sm"
                        variant="outline"
                        className="border-purple-500/20"
                      >
                        <MoveUp className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => reorderMutation.mutate({ id: banner._id, direction: "down" })}
                        disabled={index === banners.length - 1}
                        size="sm"
                        variant="outline"
                        className="border-purple-500/20"
                      >
                        <MoveDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() => openEditDialog(banner)}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-purple-500/20"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeletingBanner(banner)}
                      size="sm"
                      variant="outline"
                      className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingBanner}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingBanner(null);
            reset();
          }
        }}
      >
        <DialogContent className="max-w-2xl bg-slate-900 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingBanner ? "Edit Banner" : "Create Banner"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="title" className="text-gray-300">
                Title *
              </Label>
              <Input
                id="title"
                {...register("title")}
                placeholder="Premium Gaming Accessories"
                className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
              />
              {errors.title && (
                <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="subtitle" className="text-gray-300">
                Subtitle
              </Label>
              <Input
                id="subtitle"
                {...register("subtitle")}
                placeholder="Level up your gaming experience"
                className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
              />
            </div>

            <div>
              <Label htmlFor="image" className="text-gray-300">
                Image URL *
              </Label>
              <Input
                id="image"
                {...register("image")}
                placeholder="https://..."
                className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
              />
              {errors.image && (
                <p className="text-red-400 text-sm mt-1">{errors.image.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ctaText" className="text-gray-300">
                  Button Text
                </Label>
                <Input
                  id="ctaText"
                  {...register("ctaText")}
                  placeholder="Shop Now"
                  className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
                />
              </div>

              <div>
                <Label htmlFor="ctaLink" className="text-gray-300">
                  Button Link
                </Label>
                <Input
                  id="ctaLink"
                  {...register("ctaLink")}
                  placeholder="/categories"
                  className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
                />
              </div>
            </div>

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

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingBanner(null);
                  reset();
                }}
                variant="outline"
                className="border-purple-500/20"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {editingBanner ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingBanner}
        onOpenChange={() => setDeletingBanner(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-purple-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Banner</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{deletingBanner?.title}"?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-purple-500/20">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingBanner && deleteMutation.mutate(deletingBanner._id)}
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
