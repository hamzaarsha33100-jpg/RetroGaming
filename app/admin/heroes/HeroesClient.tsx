"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  Layout,
  MoveUp,
  MoveDown,
  X,
  Eye,
  EyeOff,
} from "lucide-react";
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

const heroSchema = z.object({
  title: z.string().min(3, "Title is required"),
  subtitle: z.string().optional(),
  description: z.string().optional(),
  image: z.string().url("Valid image URL required"),
  additionalImages: z.array(z.string().url()).optional(),
  ctaText: z.string().optional(),
  ctaLink: z.string().optional(),
  secondaryCtaText: z.string().optional(),
  secondaryCtaLink: z.string().optional(),
  overlayColor: z.string().optional(),
  overlayOpacity: z.number().min(0).max(1).optional(),
  badge: z.string().optional(),
  isActive: z.boolean(),
  sortOrder: z.number().min(0),
});

type HeroFormData = z.infer<typeof heroSchema>;

interface Hero extends HeroFormData {
  _id: string;
  createdAt: string;
}

export default function HeroesClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingHero, setEditingHero] = useState<Hero | null>(null);
  const [deletingHero, setDeletingHero] = useState<Hero | null>(null);
  const [newImageUrl, setNewImageUrl] = useState("");

  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<HeroFormData>({
    resolver: zodResolver(heroSchema),
    defaultValues: {
      isActive: true,
      sortOrder: 0,
      additionalImages: [],
      overlayOpacity: 0.5,
    },
  });

  const additionalImages = watch("additionalImages") || [];

  const { data: heroes = [], isLoading } = useQuery<Hero[]>({
    queryKey: ["admin-heroes"],
    queryFn: async () => {
      const res = await fetch("/api/admin/banners");
      if (!res.ok) throw new Error("Failed to fetch heroes");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: HeroFormData) => {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create hero");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-heroes"] });
      toast.success("Hero slide created successfully!");
      setIsCreateOpen(false);
      reset();
    },
    onError: () => {
      toast.error("Failed to create hero slide");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HeroFormData> }) => {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update hero");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-heroes"] });
      toast.success("Hero slide updated successfully!");
      setEditingHero(null);
      reset();
    },
    onError: () => {
      toast.error("Failed to update hero slide");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete hero");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-heroes"] });
      toast.success("Hero slide deleted successfully!");
      setDeletingHero(null);
    },
    onError: () => {
      toast.error("Failed to delete hero slide");
    },
  });

  const reorderMutation = useMutation({
    mutationFn: async ({ id, direction }: { id: string; direction: "up" | "down" }) => {
      const res = await fetch(`/api/admin/banners/${id}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction }),
      });
      if (!res.ok) throw new Error("Failed to reorder hero");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-heroes"] });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await fetch(`/api/admin/banners/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error("Failed to toggle hero");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-heroes"] });
      toast.success("Hero slide updated!");
    },
  });

  const addAdditionalImage = () => {
    if (!newImageUrl) return;
    try {
      new URL(newImageUrl);
    } catch {
      toast.error("Please enter a valid URL");
      return;
    }
    const current = watch("additionalImages") || [];
    setValue("additionalImages", [...current, newImageUrl]);
    setNewImageUrl("");
  };

  const removeAdditionalImage = (index: number) => {
    const current = watch("additionalImages") || [];
    setValue(
      "additionalImages",
      current.filter((_, i) => i !== index)
    );
  };

  const onSubmit = (data: HeroFormData) => {
    if (editingHero) {
      updateMutation.mutate({ id: editingHero._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openEditDialog = (hero: Hero) => {
    setEditingHero(hero);
    setValue("title", hero.title);
    setValue("subtitle", hero.subtitle || "");
    setValue("description", hero.description || "");
    setValue("image", hero.image);
    setValue("additionalImages", hero.additionalImages || []);
    setValue("ctaText", hero.ctaText || "");
    setValue("ctaLink", hero.ctaLink || "");
    setValue("secondaryCtaText", hero.secondaryCtaText || "");
    setValue("secondaryCtaLink", hero.secondaryCtaLink || "");
    setValue("overlayColor", hero.overlayColor || "");
    setValue("overlayOpacity", hero.overlayOpacity ?? 0.5);
    setValue("badge", hero.badge || "");
    setValue("isActive", hero.isActive);
    setValue("sortOrder", hero.sortOrder);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="gaming-card p-6 animate-pulse">
            <div className="h-48 bg-gaming-dark rounded mb-4" />
            <div className="h-6 bg-gaming-dark rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setIsCreateOpen(true);
            reset();
          }}
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Hero Slide
        </Button>
      </div>

      {heroes.length === 0 ? (
        <div className="gaming-card p-12 text-center">
          <Layout className="w-16 h-16 text-gaming-textMuted mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Hero Slides</h3>
          <p className="text-gray-400 mb-6">Create your first hero slide</p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="btn-primary"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Hero Slide
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {heroes.map((hero, index) => (
            <motion.div
              key={hero._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="gaming-card overflow-hidden hover:border-neon-cyan/40 transition"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
                <div className="relative h-48 md:col-span-1 rounded-lg overflow-hidden">
                  <img
                    src={hero.image}
                    alt={hero.title}
                    className="w-full h-full object-cover"
                  />
                  {hero.badge && (
                    <Badge className="absolute top-2 left-2 bg-neon-cyan/90 text-gaming-dark">
                      {hero.badge}
                    </Badge>
                  )}
                  <Badge
                    className={`absolute top-2 right-2 ${
                      hero.isActive
                        ? "bg-green-500/90 text-white"
                        : "bg-gray-500/90 text-white"
                    }`}
                  >
                    {hero.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="md:col-span-2 flex flex-col">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">
                      {hero.title}
                    </h3>
                    {hero.subtitle && (
                      <p className="text-neon-cyan mb-2">{hero.subtitle}</p>
                    )}
                    {hero.description && (
                      <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                        {hero.description}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {hero.ctaText && (
                        <Badge className="bg-neon-cyan/20 text-neon-cyan">
                          CTA: {hero.ctaText}
                        </Badge>
                      )}
                      {hero.secondaryCtaText && (
                        <Badge className="bg-neon-purple/20 text-neon-purple">
                          Secondary: {hero.secondaryCtaText}
                        </Badge>
                      )}
                      {hero.additionalImages && hero.additionalImages.length > 0 && (
                        <Badge className="bg-blue-500/20 text-blue-400">
                          +{hero.additionalImages.length} images
                        </Badge>
                      )}
                      {hero.overlayColor && (
                        <Badge className="bg-orange-500/20 text-orange-400">
                          Overlay: {hero.overlayColor} ({Math.round((hero.overlayOpacity || 0.5) * 100)}%)
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <div className="flex gap-1">
                      <Button
                        onClick={() => reorderMutation.mutate({ id: hero._id, direction: "up" })}
                        disabled={index === 0}
                        size="sm"
                        variant="outline"
                        className="border-gaming-border"
                      >
                        <MoveUp className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => reorderMutation.mutate({ id: hero._id, direction: "down" })}
                        disabled={index === heroes.length - 1}
                        size="sm"
                        variant="outline"
                        className="border-gaming-border"
                      >
                        <MoveDown className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={() =>
                        toggleActiveMutation.mutate({
                          id: hero._id,
                          isActive: !hero.isActive,
                        })
                      }
                      size="sm"
                      variant="outline"
                      className="border-gaming-border"
                    >
                      {hero.isActive ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      onClick={() => openEditDialog(hero)}
                      size="sm"
                      variant="outline"
                      className="flex-1 border-gaming-border"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => setDeletingHero(hero)}
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

      <Dialog
        open={isCreateOpen || !!editingHero}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingHero(null);
            reset();
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gaming-surface border-gaming-border">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingHero ? "Edit Hero Slide" : "Create Hero Slide"}
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
                className="input-gaming mt-1.5"
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
                className="input-gaming mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Detailed description of the hero slide..."
                className="input-gaming mt-1.5"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="image" className="text-gray-300">
                Primary Image URL *
              </Label>
              <Input
                id="image"
                {...register("image")}
                placeholder="https://..."
                className="input-gaming mt-1.5"
              />
              {errors.image && (
                <p className="text-red-400 text-sm mt-1">{errors.image.message}</p>
              )}
            </div>

            <div>
              <Label className="text-gray-300">Additional Images</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  placeholder="https://... (enter URL and click Add)"
                  className="input-gaming flex-1"
                />
                <Button
                  type="button"
                  onClick={addAdditionalImage}
                  variant="outline"
                  className="border-gaming-border"
                >
                  Add
                </Button>
              </div>
              {additionalImages.length > 0 && (
                <div className="mt-3 space-y-2">
                  {additionalImages.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <img
                        src={url}
                        alt={`Additional ${index + 1}`}
                        className="w-16 h-16 object-cover rounded border border-gaming-border"
                      />
                      <span className="text-sm text-gray-400 flex-1 truncate">
                        {url}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(index)}
                        className="p-1 text-red-400 hover:text-red-300"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="ctaText" className="text-gray-300">
                  Primary CTA Text
                </Label>
                <Input
                  id="ctaText"
                  {...register("ctaText")}
                  placeholder="Shop Now"
                  className="input-gaming mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="ctaLink" className="text-gray-300">
                  Primary CTA Link
                </Label>
                <Input
                  id="ctaLink"
                  {...register("ctaLink")}
                  placeholder="/categories"
                  className="input-gaming mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="secondaryCtaText" className="text-gray-300">
                  Secondary CTA Text
                </Label>
                <Input
                  id="secondaryCtaText"
                  {...register("secondaryCtaText")}
                  placeholder="Learn More"
                  className="input-gaming mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="secondaryCtaLink" className="text-gray-300">
                  Secondary CTA Link
                </Label>
                <Input
                  id="secondaryCtaLink"
                  {...register("secondaryCtaLink")}
                  placeholder="/about"
                  className="input-gaming mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="overlayColor" className="text-gray-300">
                  Overlay Color
                </Label>
                <Input
                  id="overlayColor"
                  {...register("overlayColor")}
                  placeholder="#000000"
                  className="input-gaming mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="overlayOpacity" className="text-gray-300">
                  Overlay Opacity (0-1)
                </Label>
                <Input
                  id="overlayOpacity"
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  {...register("overlayOpacity", { valueAsNumber: true })}
                  className="input-gaming mt-1.5"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="badge" className="text-gray-300">
                  Badge Text
                </Label>
                <Input
                  id="badge"
                  {...register("badge")}
                  placeholder="NEW"
                  className="input-gaming mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="sortOrder" className="text-gray-300">
                  Sort Order
                </Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min="0"
                  {...register("sortOrder", { valueAsNumber: true })}
                  className="input-gaming mt-1.5"
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
                  setEditingHero(null);
                  reset();
                }}
                variant="outline"
                className="border-gaming-border"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="btn-primary"
              >
                {editingHero ? "Update" : "Create"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!deletingHero}
        onOpenChange={() => setDeletingHero(null)}
      >
        <AlertDialogContent className="bg-gaming-surface border-gaming-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Hero Slide</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete &quot;{deletingHero?.title}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gaming-border">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingHero && deleteMutation.mutate(deletingHero._id)}
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
