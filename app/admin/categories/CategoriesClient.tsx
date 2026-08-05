"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
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

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  productCount?: number;
  isActive: boolean;
  createdAt: string;
}

export default function CategoriesClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories?admin=true");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category created successfully!");
      setIsCreateOpen(false);
      setFormData({ name: "", description: "", image: "" });
    },
    onError: () => {
      toast.error("Failed to create category");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to update category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category updated successfully!");
      setEditingCategory(null);
      setFormData({ name: "", description: "", image: "" });
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted successfully!");
      setDeletingCategory(null);
    },
    onError: () => {
      toast.error("Failed to delete category");
    },
  });

  const handleCreate = () => {
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingCategory) return;
    updateMutation.mutate({ id: editingCategory._id, data: formData });
  };

  const handleDelete = () => {
    if (!deletingCategory) return;
    deleteMutation.mutate(deletingCategory._id);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
    });
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-slate-900/50 rounded-2xl p-6 animate-pulse"
          >
            <div className="h-32 bg-slate-800 rounded-lg mb-4" />
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
          onClick={() => setIsCreateOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Category
        </Button>
      </div>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <div className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Categories</h3>
          <p className="text-gray-400 mb-6">
            Create your first category to organize products
          </p>
          <Button
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-900/50 backdrop-blur-xl border border-purple-500/20 rounded-2xl overflow-hidden hover:border-purple-500/40 transition group"
            >
              {/* Image */}
              {category.image ? (
                <div className="h-32 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center">
                  <FolderOpen className="w-12 h-12 text-purple-400" />
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                <h3 className="font-bold text-white text-lg mb-2">
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500">
                    {category.productCount || 0} products
                  </span>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      category.isActive
                        ? "bg-green-500/10 text-green-500"
                        : "bg-gray-500/10 text-gray-500"
                    }`}
                  >
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => openEditDialog(category)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-purple-500/20"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setDeletingCategory(category)}
                    variant="outline"
                    size="sm"
                    className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={isCreateOpen || !!editingCategory}
        onOpenChange={(open) => {
          if (!open) {
            setIsCreateOpen(false);
            setEditingCategory(null);
            setFormData({ name: "", description: "", image: "" });
          }
        }}
      >
        <DialogContent className="bg-slate-900 border-purple-500/20">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingCategory ? "Edit Category" : "Create Category"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-gray-300">
                Category Name *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Controllers"
                className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-gray-300">
                Description
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Category description..."
                rows={3}
                className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
              />
            </div>

            <div>
              <Label htmlFor="image" className="text-gray-300">
                Image URL
              </Label>
              <Input
                id="image"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="https://..."
                className="mt-1.5 bg-slate-800/50 border-purple-500/20 text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                onClick={() => {
                  setIsCreateOpen(false);
                  setEditingCategory(null);
                }}
                variant="outline"
                className="border-purple-500/20"
              >
                Cancel
              </Button>
              <Button
                onClick={editingCategory ? handleUpdate : handleCreate}
                disabled={!formData.name.trim()}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                {editingCategory ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingCategory}
        onOpenChange={() => setDeletingCategory(null)}
      >
        <AlertDialogContent className="bg-slate-900 border-purple-500/20">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Delete Category
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete "{deletingCategory?.name}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-purple-500/20">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
