import { Metadata } from "next";
import { notFound } from "next/navigation";
import connectDB from "@/lib/mongodb";
import Product from "@/models/Product";
import Review from "@/models/Review";
import ProductDetailClient from "./ProductDetailClient";
import ProductSection from "@/components/home/ProductSection";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  await connectDB();
  const product = await Product.findOne({ slug, isActive: true })
    .populate("category", "name slug")
    .lean();
  return product ? JSON.parse(JSON.stringify(product)) : null;
}

async function getRelatedProducts(categoryId: string, excludeId: string) {
  const products = await Product.find({
    category: categoryId,
    _id: { $ne: excludeId },
    isActive: true,
  })
    .populate("category", "name slug")
    .limit(4)
    .lean();
  return JSON.parse(JSON.stringify(products));
}

async function getReviews(productId: string) {
  const reviews = await Review.find({ product: productId, isApproved: true })
    .populate("user", "name image")
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();
  return JSON.parse(JSON.stringify(reviews));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Product Not Found" };

  return {
    title: product.seoTitle || product.name,
    description: product.seoDescription || product.shortDescription || product.description?.slice(0, 160),
    openGraph: {
      title: product.name,
      description: product.shortDescription || product.description?.slice(0, 160),
      images: [{ url: product.mainImage, alt: product.name }],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  // Increment views
  await Product.findByIdAndUpdate(product._id, { $inc: { views: 1 } });

  const [relatedProducts, reviews] = await Promise.all([
    getRelatedProducts(
      typeof product.category === "object" ? product.category._id : product.category,
      product._id
    ),
    getReviews(product._id),
  ]);

  return (
    <>
      <ProductDetailClient product={product} reviews={reviews} />
      {relatedProducts.length > 0 && (
        <div className="mt-8">
          <ProductSection
            title="Related"
            accent="Products"
            subtitle="You May Also Like"
            products={relatedProducts}
          />
        </div>
      )}
    </>
  );
}
