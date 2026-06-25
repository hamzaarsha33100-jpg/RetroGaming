import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      isActive?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    isActive?: boolean;
  }

  interface JWT {
    id?: string;
    role?: string;
    isActive?: boolean;
  }
}

export interface Product {
  _id: string;
  name: string;
  slug: string;
  category: Category | string;
  brand: string;
  price: number;
  salePrice?: number;
  discountPercentage?: number;
  stockQuantity: number;
  sku: string;
  description: string;
  shortDescription?: string;
  specifications: { key: string; value: string }[];
  tags: string[];
  mainImage: string;
  galleryImages: { url: string; alt?: string; isPrimary?: boolean }[];
  bannerImage?: string;
  imageTransition: "fade" | "slide" | "zoom" | "flip";
  isFeatured: boolean;
  isTrending: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  isOutOfStock: boolean;
  rating: number;
  reviewCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number;
  quantity: number;
  maxQuantity: number;
  isOutOfStock: boolean;
}

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  salePrice?: number;
  isOutOfStock: boolean;
  addedAt: string;
}

export interface Order {
  _id: string;
  orderId: string;
  user: { _id: string; name: string; email: string } | string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponCode?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  paymentIntentId?: string;
  trackingNumber?: string;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  product: string | Product;
  name: string;
  image: string;
  price: number;
  quantity: number;
  total: number;
}

export interface Address {
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
}

export interface OrderTimeline {
  status: string;
  message: string;
  timestamp: string;
}

export interface Review {
  _id: string;
  product: string;
  user: { _id: string; name: string; image?: string };
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerified: boolean;
  helpfulVotes: number;
  createdAt: string;
}

export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  description?: string;
  image: string;
  mobileImage?: string;
  ctaText?: string;
  ctaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  isActive: boolean;
  sortOrder: number;
  position: "hero" | "promotional" | "category" | "sidebar";
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

export interface ProductFilters extends PaginationParams {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  search?: string;
  tags?: string[];
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
}
