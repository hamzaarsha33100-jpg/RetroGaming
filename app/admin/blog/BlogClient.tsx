"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Newspaper,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Eye,
  ImagePlus,
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
import { formatDateTime, slugify } from "@/lib/utils";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  image?: string;
  author?: string;
  tags: string[];
  isPublished: boolean;
  publishedAt?: string;
  views: number;
  createdAt: string;
}

export default function BlogClient() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState<BlogPost | null>(null);

  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    image: "",
    author: "",
    tags: "",
    isPublished: false,
    seoTitle: "",
    seoDescription: "",
  });

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["admin-blog"],
    queryFn: async () => {
      const res = await fetch("/api/blog?admin=true&limit=100");
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    },
  });

  const openCreate = () => {
    setForm({
      title: "",
      slug: "",
      excerpt: "",
      content: "",
      image: "",
      author: "",
      tags: "",
      isPublished: false,
      seoTitle: "",
      seoDescription: "",
    });
    setIsCreateOpen(true);
  };

  const openEdit = (p: BlogPost) => {
    setEditing(p);
    setForm({
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || "",
      content: p.content,
      image: p.image || "",
      author: p.author || "",
      tags: p.tags.join(", "),
      isPublished: p.isPublished,
      seoTitle: "",
      seoDescription: "",
    });
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        title: form.title,
        slug: form.slug || slugify(form.title),
        excerpt: form.excerpt,
        content: form.content,
        image: form.image || undefined,
        author: form.author || undefined,
        tags: form.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isPublished: form.isPublished,
        seoTitle: form.seoTitle || undefined,
        seoDescription: form.seoDescription || undefined,
      };
      const res = await fetch(
        editing ? `/api/blog/${editing._id}` : "/api/blog",
        {
          method: editing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || "Failed to save post");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      toast.success(editing ? "Post updated" : "Post created");
      setIsCreateOpen(false);
      setEditing(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/blog/${deleting!._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete post");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog"] });
      toast.success("Post deleted");
      setDeleting(null);
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-gaming font-bold text-white flex items-center gap-3">
            <Newspaper className="w-7 h-7 text-neon-cyan" />
            Blog Posts
          </h1>
          <p className="text-gaming-textMuted text-sm mt-1">
            Manage blog posts, publish updates, and SEO metadata.
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2">
          <Plus className="w-4 h-4" />
          New Post
        </Button>
      </div>

      <div className="gaming-card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24">
            <Newspaper className="w-16 h-16 text-gaming-border mx-auto mb-4" />
            <p className="text-gaming-textMuted">No blog posts yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gaming-border">
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Post</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Author</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Views</th>
                  <th className="text-left px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Published</th>
                  <th className="text-right px-4 py-3 text-gaming-textMuted text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={p._id} className="border-b border-gaming-border hover:bg-white/5 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {p.image && (
                          <img src={p.image} alt={p.title} className="w-10 h-10 rounded-lg object-cover" />
                        )}
                        <div>
                          <p className="text-gaming-text text-sm font-medium">{p.title}</p>
                          <p className="text-gaming-textMuted text-xs">/{p.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-gaming-textMuted text-sm">{p.author || "—"}</td>
                    <td className="px-4 py-4">
                      <Badge
                        className={
                          p.isPublished
                            ? "bg-neon-green/10 text-neon-green border border-neon-green/20"
                            : "bg-gaming-border/20 text-gaming-textMuted border border-gaming-border"
                        }
                      >
                        {p.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-gaming-textMuted text-sm tabular-nums">{p.views}</td>
                    <td className="px-4 py-4 text-gaming-textMuted text-sm">
                      {p.publishedAt ? formatDateTime(p.publishedAt) : "—"}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={`/blog/${p.slug}`}
                          target="_blank"
                          className="p-2 text-gaming-textMuted hover:text-neon-cyan transition-colors rounded-lg hover:bg-white/5"
                          title="View post"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                        <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setDeleting(p)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Post" : "Create Blog Post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value, slug: form.slug || slugify(e.target.value) })
                }
                placeholder="Post title"
              />
            </div>
            <div>
              <Label>Slug</Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                placeholder="my-blog-post"
              />
            </div>
            <div>
              <Label>Excerpt</Label>
              <Textarea
                value={form.excerpt}
                onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                rows={2}
                placeholder="Short summary shown in listings"
              />
            </div>
            <div>
              <Label>Content (HTML supported)</Label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                rows={10}
                placeholder="<p>Write your blog post content here...</p>"
              />
            </div>
            <div>
              <Label>Featured Image URL</Label>
              <div className="flex gap-2">
                <Input
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                  placeholder="https://..."
                />
                <Button variant="outline" size="icon" type="button">
                  <ImagePlus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Author</Label>
                <Input
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Staff Writer"
                />
              </div>
              <div>
                <Label>Tags (comma separated)</Label>
                <Input
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="gaming, news, reviews"
                />
              </div>
            </div>
            <label className="flex items-center justify-between gap-4 rounded-lg border border-gaming-border p-4">
              <div>
                <p className="text-sm font-medium text-white">Publish</p>
                <p className="text-xs text-gaming-textMuted">Make this post publicly visible</p>
              </div>
              <Switch
                checked={form.isPublished}
                onCheckedChange={(v) => setForm({ ...form, isPublished: v })}
              />
            </label>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.title || !form.content}
              className="w-full"
            >
              {saveMutation.isPending ? "Saving..." : editing ? "Save Changes" : "Create Post"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete dialog */}
      <AlertDialog open={!!deleting} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete post?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleting?.title}" will be permanently removed.
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
