"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Upload, Trash2, Plus } from "lucide-react";
import { slugify } from "@/lib/utils";

const productSchema = z.object({
  name: z.string().min(2, "Name is required"),
  slug: z.string().min(2, "Slug is required"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  price: z.number().min(0, "Price must be positive"),
  salePrice: z.union([z.number().min(0), z.nan()]).optional().transform((v) => (Number.isNaN(v) ? undefined : v)),
  stockQuantity: z.number().min(0, "Stock must be 0 or more"),
  minStockLevel: z.number().min(0, "Min stock must be 0 or more"),
  maxStockLevel: z.union([z.number().min(0), z.nan()]).optional().transform((v) => (Number.isNaN(v) ? undefined : v)),
  sku: z.string().min(1, "SKU is required"),
  barcode: z.string().optional(),
  warehouseLocation: z.string().optional(),
  description: z.string().min(10, "Description is required"),
  shortDescription: z.string().optional(),
  mainImage: z.string().url("Valid image URL required"),
  mainImageFileId: z.string().optional(),
  isFeatured: z.boolean(),
  isTrending: z.boolean(),
  isNewArrival: z.boolean(),
  isBestSeller: z.boolean(),
  isActive: z.boolean(),
  variantAttributes: z.array(z.string()).optional(),
  variants: z.array(z.object({
    name: z.string().min(1, "Variant name is required"),
    sku: z.string().min(1, "SKU is required"),
    price: z.number().min(0, "Price must be positive"),
    salePrice: z.number().min(0).optional(),
    stockQuantity: z.number().min(0, "Stock must be 0 or more"),
    attributes: z.array(z.object({ key: z.string(), value: z.string() })),
    image: z.string().url("Valid URL required").optional(),
  })).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface Category {
  _id: string;
  name: string;
}

interface ProductFormProps {
  productId?: string;
  initialData?: Partial<ProductFormData>;
}

export default function ProductForm({ productId, initialData }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!!productId);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [originalImageFileId, setOriginalImageFileId] = useState<string>();
  const [variantAttributesString, setVariantAttributesString] = useState(initialData?.variantAttributes?.join(", ") || "");
  const [variants, setVariants] = useState<Array<{
    name: string; sku: string; price: number; salePrice?: number;
    stockQuantity: number; attributes: { key: string; value: string }[]; image?: string;
  }>>(initialData?.variants || []);
  const isEditing = !!productId;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isFeatured: false,
      isTrending: false,
      isNewArrival: false,
      isBestSeller: false,
      isActive: true,
      minStockLevel: 5,
      variantAttributes: [],
      variants: [],
      ...initialData,
    },
  });

  const name = watch("name");
  const mainImage = watch("mainImage");
  const mainImageFileId = watch("mainImageFileId");

  useEffect(() => {
    if (!isEditing && name) {
      setValue("slug", slugify(name));
    }
  }, [name, isEditing, setValue]);

  useEffect(() => {
    fetch("/api/categories?admin=true")
      .then((res) => res.json())
      .then((data) => setCategories(data.data || []))
      .catch(() => toast.error("Failed to load categories"));
  }, []);

  useEffect(() => {
    if (!productId) return;

    fetch(`/api/products/${productId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const p = data.data;
          setValue("name", p.name);
          setValue("slug", p.slug);
          setValue("category", p.category?._id || p.category);
          setValue("brand", p.brand);
          setValue("price", p.price);
          setValue("salePrice", p.salePrice ?? null);
          setValue("stockQuantity", p.stockQuantity);
          setValue("minStockLevel", p.minStockLevel ?? 5);
          setValue("maxStockLevel", p.maxStockLevel ?? null);
          setValue("sku", p.sku);
          setValue("barcode", p.barcode || "");
          setValue("warehouseLocation", p.warehouseLocation || "");
          setValue("description", p.description);
          setValue("shortDescription", p.shortDescription || "");
          setValue("mainImage", p.mainImage);
          setValue("mainImageFileId", p.mainImageFileId || "");
          setOriginalImageFileId(p.mainImageFileId || "");
          setValue("isFeatured", p.isFeatured);
          setValue("isTrending", p.isTrending);
          setValue("isNewArrival", p.isNewArrival);
          setValue("isBestSeller", p.isBestSeller);
          setValue("isActive", p.isActive);
          setValue("variantAttributes", p.variantAttributes || []);
          setVariantAttributesString(p.variantAttributes?.join(", ") || "");
          setVariants(p.variants || []);
        }
      })
      .catch(() => toast.error("Failed to load product"))
      .finally(() => setLoading(false));
  }, [productId, setValue]);

  const deleteUploadedImage = async (fileId?: string) => {
    if (!fileId) return;
    await fetch("/api/imagekit/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fileId }),
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const currentFileId = mainImageFileId;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("productName", name || "product");

      const res = await fetch("/api/imagekit/upload", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (!res.ok || !result.success) {
        throw new Error(result.error || "Failed to upload image");
      }

      if (currentFileId && currentFileId !== originalImageFileId) {
        await deleteUploadedImage(currentFileId);
      }

      setValue("mainImage", result.data.url, { shouldValidate: true });
      setValue("mainImageFileId", result.data.fileId);
      toast.success("Image uploaded");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      event.target.value = "";
      setImageUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    const currentFileId = mainImageFileId;
    try {
      if (currentFileId && currentFileId !== originalImageFileId) {
        await deleteUploadedImage(currentFileId);
      }
      setValue("mainImage", "", { shouldValidate: true });
      setValue("mainImageFileId", "");
      toast.success("Image removed");
    } catch {
      toast.error("Failed to remove uploaded image");
    }
  };

  const attributeKeys = variantAttributesString
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const addVariant = () => {
    const newAttrs: { key: string; value: string }[] = attributeKeys.map((k) => ({ key: k, value: "" }));
    setVariants([
      ...variants,
      { name: "", sku: "", price: 0, salePrice: 0, stockQuantity: 0, attributes: newAttrs, image: "" },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string | number) => {
    setVariants(
      variants.map((v, i) => (i === index ? { ...v, [field]: value } : v))
    );
  };

  const updateVariantAttribute = (index: number, key: string, value: string) => {
    setVariants(
      variants.map((v, i) => {
        if (i !== index) return v;
        const existing = v.attributes.find((a) => a.key === key);
        if (existing) {
          return { ...v, attributes: v.attributes.map((a) => a.key === key ? { ...a, value } : a) };
        }
        return { ...v, attributes: [...v.attributes, { key, value }] };
      })
    );
  };

  const onSubmit = async (data: ProductFormData) => {
    setSaving(true);
    try {
      const payload = {
        ...data,
        salePrice: data.salePrice || undefined,
        shortDescription: data.shortDescription || undefined,
        variantAttributes: attributeKeys,
        variants: variants.filter((v) => v.name && v.sku),
      };

      const url = isEditing ? `/api/products/${productId}` : "/api/products";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to save product");

      toast.success(isEditing ? "Product updated!" : "Product created!");
      router.push("/admin/products");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <Loader2 className="w-8 h-8 text-neon-cyan animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="gaming-card p-6 space-y-4">
          <h2 className="text-lg font-gaming font-semibold text-white">Basic Info</h2>

          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">Product Name *</label>
            <input {...register("name")} className="input-gaming w-full" />
            {errors.name && <p className="text-destructive text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">Slug *</label>
            <input {...register("slug")} className="input-gaming w-full font-mono text-sm" />
            {errors.slug && <p className="text-destructive text-sm mt-1">{errors.slug.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gaming-textMuted mb-1">Category *</label>
              <select {...register("category")} className="input-gaming w-full">
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-destructive text-sm mt-1">{errors.category.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-gaming-textMuted mb-1">Brand *</label>
              <input {...register("brand")} className="input-gaming w-full" />
              {errors.brand && <p className="text-destructive text-sm mt-1">{errors.brand.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">SKU *</label>
            <input {...register("sku")} className="input-gaming w-full font-mono" />
            {errors.sku && <p className="text-destructive text-sm mt-1">{errors.sku.message}</p>}
          </div>

          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">Short Description</label>
            <input {...register("shortDescription")} className="input-gaming w-full" />
          </div>

          <div>
            <label className="block text-sm text-gaming-textMuted mb-1">Description *</label>
            <textarea {...register("description")} rows={4} className="input-gaming w-full resize-none" />
            {errors.description && (
              <p className="text-destructive text-sm mt-1">{errors.description.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="gaming-card p-6 space-y-4">
            <h2 className="text-lg font-gaming font-semibold text-white">Pricing & Stock</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gaming-textMuted mb-1">Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("price", { valueAsNumber: true })}
                  className="input-gaming w-full"
                />
                {errors.price && <p className="text-destructive text-sm mt-1">{errors.price.message}</p>}
              </div>
              <div>
                <label className="block text-sm text-gaming-textMuted mb-1">Sale Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  {...register("salePrice", { valueAsNumber: true })}
                  className="input-gaming w-full"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gaming-textMuted mb-1">Stock Quantity *</label>
              <input
                type="number"
                {...register("stockQuantity", { valueAsNumber: true })}
                className="input-gaming w-full"
              />
              {errors.stockQuantity && (
                <p className="text-destructive text-sm mt-1">{errors.stockQuantity.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gaming-textMuted mb-1">Minimum Stock Level</label>
                <input
                  type="number"
                  min={0}
                  {...register("minStockLevel", { valueAsNumber: true })}
                  className="input-gaming w-full"
                  placeholder="Alert when stock drops below"
                />
              </div>
              <div>
                <label className="block text-sm text-gaming-textMuted mb-1">Maximum Stock Level</label>
                <input
                  type="number"
                  min={0}
                  {...register("maxStockLevel", { valueAsNumber: true })}
                  className="input-gaming w-full"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gaming-textMuted mb-1">Barcode</label>
                <input
                  {...register("barcode")}
                  className="input-gaming w-full"
                  placeholder="Optional (UPC/EAN)"
                />
              </div>
              <div>
                <label className="block text-sm text-gaming-textMuted mb-1">Warehouse Location</label>
                <input
                  {...register("warehouseLocation")}
                  className="input-gaming w-full"
                  placeholder="e.g. Aisle B, Shelf 3"
                />
              </div>
            </div>
          </div>

          <div className="gaming-card p-6 space-y-4">
            <h2 className="text-lg font-gaming font-semibold text-white">Media</h2>
            <div>
              <label className="block text-sm text-gaming-textMuted mb-1">Main Image URL *</label>
              <input {...register("mainImage")} className="input-gaming w-full" placeholder="https://..." />
              <input type="hidden" {...register("mainImageFileId")} />
              {errors.mainImage && (
                <p className="text-destructive text-sm mt-1">{errors.mainImage.message}</p>
              )}
            </div>
            <label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-gaming-border bg-gaming-dark/50 p-4 text-center transition-colors hover:border-neon-cyan/60">
              {imageUploading ? (
                <Loader2 className="mb-2 h-6 w-6 animate-spin text-neon-cyan" />
              ) : (
                <Upload className="mb-2 h-6 w-6 text-neon-cyan" />
              )}
              <span className="text-sm text-gaming-text">
                {imageUploading ? "Uploading to ImageKit..." : "Upload product image"}
              </span>
              <span className="mt-1 text-xs text-gaming-textMuted">
                JPG, PNG or WebP up to 5MB
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={imageUploading}
                className="sr-only"
              />
            </label>
            {mainImage && (
              <div className="relative overflow-hidden rounded-lg bg-gaming-dark">
                <Image
                  src={mainImage}
                  alt="Preview"
                  width={640}
                  height={240}
                  className="h-40 w-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute right-3 top-3 rounded-lg bg-gaming-dark/90 p-2 text-gaming-textMuted transition-colors hover:text-destructive"
                  title="Remove image"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="gaming-card p-6 space-y-3">
            <h2 className="text-lg font-gaming font-semibold text-white mb-2">Home Page Placement</h2>
            <p className="text-xs text-gaming-textMuted">
              Choose which homepage rows should show this product.
            </p>
            {(
              [
                ["isActive", "Active"],
                ["isFeatured", "Featured Gear row"],
                ["isTrending", "Trending Now row"],
                ["isBestSeller", "Best Sellers row"],
                ["isNewArrival", "New Arrivals row"],
              ] as const
            ).map(([field, label]) => (
              <label key={field} className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register(field)} className="rounded border-gaming-border" />
                <span className="text-gaming-text text-sm">{label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="gaming-card p-6 space-y-4">
        <h2 className="text-lg font-gaming font-semibold text-white">Variants</h2>
        <p className="text-xs text-gaming-textMuted">
          Optionally add product variants (e.g. different editions, colors, storage sizes). Each variant can have its own SKU, price, and stock.
        </p>

        <div>
          <label className="block text-sm text-gaming-textMuted mb-1">
            Variant Attributes
          </label>
          <input
            type="text"
            value={variantAttributesString}
            onChange={(e) => {
              const val = e.target.value;
              setVariantAttributesString(val);
              const keys = val.split(",").map((s) => s.trim()).filter(Boolean);
              setValue("variantAttributes", keys, { shouldDirty: true });
              setVariants((prev) =>
                prev.map((v) => {
                  const newAttrs: { key: string; value: string }[] = keys.map((k) => {
                    const existing = v.attributes.find((a) => a.key === k);
                    return { key: k, value: existing?.value || "" };
                  });
                  return { ...v, attributes: newAttrs };
                })
              );
            }}
            className="input-gaming w-full"
            placeholder="e.g. Color, Storage, Edition"
          />
          <p className="text-xs text-gaming-textMuted mt-1">
            Comma-separated keys. These appear as attribute fields on each variant.
          </p>
        </div>

        {variants.length > 0 && (
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="rounded-lg border border-gaming-border bg-gaming-dark/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gaming-text">
                    Variant {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-gaming-textMuted hover:text-destructive transition-colors flex items-center gap-1 text-xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gaming-textMuted mb-1">Name *</label>
                    <input
                      type="text"
                      value={variant.name}
                      onChange={(e) => updateVariant(index, "name", e.target.value)}
                      className="input-gaming w-full"
                      placeholder="e.g. Disc Edition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gaming-textMuted mb-1">SKU *</label>
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      className="input-gaming w-full font-mono"
                      placeholder="e.g. PS5-DISC-001"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-gaming-textMuted mb-1">Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={variant.price || ""}
                      onChange={(e) => updateVariant(index, "price", parseFloat(e.target.value) || 0)}
                      className="input-gaming w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gaming-textMuted mb-1">Sale Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={variant.salePrice || ""}
                      onChange={(e) => updateVariant(index, "salePrice", parseFloat(e.target.value) || 0)}
                      className="input-gaming w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gaming-textMuted mb-1">Stock *</label>
                    <input
                      type="number"
                      value={variant.stockQuantity || ""}
                      onChange={(e) => updateVariant(index, "stockQuantity", parseInt(e.target.value) || 0)}
                      className="input-gaming w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-gaming-textMuted mb-1">Image URL</label>
                  <input
                    type="text"
                    value={variant.image}
                    onChange={(e) => updateVariant(index, "image", e.target.value)}
                    className="input-gaming w-full"
                    placeholder="https://..."
                  />
                </div>

                {attributeKeys.length > 0 && (
                  <div>
                    <label className="block text-xs text-gaming-textMuted mb-1">Attributes</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {attributeKeys.map((key) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-gaming-textMuted whitespace-nowrap min-w-[80px]">
                            {key}:
                          </span>
                          <input
                            type="text"
                            value={variant.attributes.find((a) => a.key === key)?.value || ""}
                            onChange={(e) => updateVariantAttribute(index, key, e.target.value)}
                            className="input-gaming w-full text-sm"
                            placeholder={key}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={addVariant}
          className="flex items-center gap-2 text-sm text-neon-cyan hover:text-neon-cyan/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Variant
        </button>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="px-4 py-2 border border-gaming-border text-gaming-textMuted rounded-lg hover:border-neon-cyan/50 transition-all flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Cancel
        </Link>
        <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          {isEditing ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
