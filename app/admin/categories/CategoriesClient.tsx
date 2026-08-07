"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, FolderOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { formatPrice } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  platform?: string;
  productCount?: number;
  isActive: boolean;
  createdAt: string;
}

const PLATFORMS: { value: string; label: string }[] = [
  { value: "general", label: "General" },
  { value: "playstation", label: "PlayStation" },
  { value: "xbox", label: "Xbox" },
  { value: "nintendo", label: "Nintendo" },
  { value: "pc", label: "PC" },
];

const PLATFORM_BADGE_STYLES: Record<string, string> = {
  general: "bg-gaming-border/20 text-gaming-textMuted border border-gaming-border",
  playstation: "bg-[#0070d1]/20 text-[#5fa8ff] border border-[#0070d1]/40",
  xbox: "bg-[#107C10]/20 text-[#39FF14] border border-[#107C10]/40",
  nintendo: "bg-[#e60012]/20 text-[#ff6b7a] border border-[#e60012]/40",
  pc: "bg-[#9b59b6]/20 text-[#c39bd3] border border-[#9b59b6]/40",
};

export default function CategoriesClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: "", description: "", image: "", platform: "general" });

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
    mutationFn: async (data: { name: string; description: string; image: string; platform: string }) => {
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
      setFormData({ name: "", description: "", image: "", platform: "general" });
    },
    onError: () => toast.error("Failed to create category"),
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; description: string; image: string; platform: string } }) => {
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
      setFormData({ name: "", description: "", image: "", platform: "general" });
    },
    onError: () => toast.error("Failed to update category"),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete category");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Category deleted successfully!");
      setDeletingCategory(null);
    },
    onError: () => toast.error("Failed to delete category"),
  });

  const handleSubmit = () => {
    if (editingCategory) {
      updateMutation.mutate({ id: editingCategory._id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description || "", image: category.image || "", platform: category.platform || "general" });
  };

  const closeDialog = () => {
    setIsCreateOpen(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", image: "", platform: "general" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => setIsCreateOpen(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="gaming-card p-12 text-center">
          <FolderOpen className="w-16 h-16 text-gaming-border mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gaming-text mb-2">No Categories</h3>
          <p className="text-gaming-textMuted mb-6">Create your first category to organize products</p>
          <button onClick={() => setIsCreateOpen(true)} className="btn-primary">
            <Plus className="w-4 h-4 mr-2 inline" />
            Add Category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category._id} className="gaming-card overflow-hidden group">
              {category.image ? (
                <div className="h-32 overflow-hidden">
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-32 bg-gradient-to-br from-neon-cyan/10 to-accent/10 flex items-center justify-center">
                  <FolderOpen className="w-12 h-12 text-neon-cyan/40" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-gaming-text text-lg">{category.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${category.isActive ? "bg-neon-green/10 text-neon-green border border-neon-green/20" : "bg-gaming-border/20 text-gaming-textMuted border border-gaming-border"}`}>
                    {category.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${PLATFORM_BADGE_STYLES[category.platform || "general"] || PLATFORM_BADGE_STYLES.general}`}>
                    {PLATFORMS.find((p) => p.value === (category.platform || "general"))?.label || "General"}
                  </span>
                </div>
                {category.description && (
                  <p className="text-gaming-textMuted text-sm mb-3 line-clamp-2">{category.description}</p>
                )}
                <p className="text-gaming-textMuted text-xs mb-4">{category.productCount || 0} products</p>
                <div className="flex gap-2">
                  <button onClick={() => openEditDialog(category)} className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gaming-border rounded-lg text-gaming-textMuted hover:text-neon-cyan hover:border-neon-cyan/50 transition-all text-sm">
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button onClick={() => setDeletingCategory(category)} className="px-3 py-2 border border-gaming-border rounded-lg text-gaming-textMuted hover:text-destructive hover:border-destructive/50 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      {(isCreateOpen || editingCategory) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDialog} />
          <div className="relative bg-gaming-surface border border-gaming-border rounded-2xl shadow-2xl w-full max-w-md p-6 animate-scale-in">
            <h2 className="text-xl font-bold text-gaming-text mb-4">
              {editingCategory
                ? `Edit ${editingCategory.name}${editingCategory.platform ? ` (${PLATFORMS.find((p) => p.value === editingCategory.platform)?.label || editingCategory.platform})` : ""}`
                : "Create Category"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gaming-textMuted mb-1.5 block">Category Name *</label>
                <input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Controllers" className="input-gaming w-full" />
              </div>
              <div>
                <label className="text-sm text-gaming-textMuted mb-1.5 block">Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Category description..." rows={3} className="input-gaming w-full resize-none" />
              </div>
              <div>
                <label className="text-sm text-gaming-textMuted mb-1.5 block">Image URL</label>
                <input value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." className="input-gaming w-full" />
              </div>
              <div>
                <label className="text-sm text-gaming-textMuted mb-1.5 block">Platform</label>
                <select value={formData.platform} onChange={(e) => setFormData({ ...formData, platform: e.target.value })} className="input-gaming w-full">
                  {PLATFORMS.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button onClick={closeDialog} className="px-4 py-2 border border-gaming-border text-gaming-textMuted rounded-lg hover:border-neon-cyan/50 transition-all text-sm">
                  Cancel
                </button>
                <button onClick={handleSubmit} disabled={!formData.name.trim()} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
                  {editingCategory ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setDeletingCategory(null)} />
          <div className="relative bg-gaming-surface border border-gaming-border rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
            <h2 className="text-xl font-bold text-gaming-text mb-2">Delete Category</h2>
            <p className="text-gaming-textMuted mb-6">
              Are you sure you want to delete &quot;{deletingCategory.name}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeletingCategory(null)} className="px-4 py-2 border border-gaming-border text-gaming-textMuted rounded-lg hover:border-neon-cyan/50 transition-all text-sm">
                Cancel
              </button>
              <button onClick={() => deleteMutation.mutate(deletingCategory._id)} className="px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-all text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
