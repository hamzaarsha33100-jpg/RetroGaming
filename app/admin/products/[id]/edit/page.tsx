import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "@/components/admin/ProductForm";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/products"
          className="text-gaming-textMuted hover:text-neon-cyan text-sm flex items-center gap-1 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Products
        </Link>
        <h1 className="text-2xl font-gaming font-bold text-white">Edit Product</h1>
        <p className="text-gaming-textMuted text-sm mt-1">
          Update product details and inventory.
        </p>
      </div>
      <ProductForm productId={id} />
    </div>
  );
}
