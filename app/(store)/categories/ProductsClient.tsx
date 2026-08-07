"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import ProductCard from "@/components/products/ProductCard";
import { motion, AnimatePresence } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  X,
  SlidersHorizontal,
  Grid3x3,
  Rows3,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Star,
  Package,
  Home,
  ChevronRight as ChevronRightIcon,
  Sparkles,
  ShoppingCart,
  Loader2,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ProductCardData } from "@/types";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
  slug: string;
  parentCategory?: string;
  icon?: string;
  sortOrder: number;
}

interface CategoryGroup {
  parent: Category | null;
  children: Category[];
}

const BRANDS = [
  "Sony PlayStation",
  "Microsoft Xbox",
  "Nintendo",
  "Razer",
  "Logitech",
  "SteelSeries",
  "Corsair",
  "HyperX",
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "popular", label: "Most Popular" },
  { value: "best-rated", label: "Best Rated" },
  { value: "name-asc", label: "Name: A to Z" },
];

const PER_PAGE_OPTIONS = [12, 24, 36, 48];

const RATING_OPTIONS = [
  { value: 4, label: "4 Stars & Up" },
  { value: 3, label: "3 Stars & Up" },
  { value: 2, label: "2 Stars & Up" },
];

function CollapsibleSection({
  title,
  count,
  defaultOpen = true,
  children,
}: {
  title: string;
  count?: number;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gaming-border/50 last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-gaming-text uppercase tracking-wider">
            {title}
          </h3>
          {count !== undefined && count > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan text-[10px] font-bold">
              {count}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gaming-textMuted transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StarRating({
  rating,
  maxRating = 5,
  size = "sm",
}: {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md";
}) {
  const starSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: maxRating }, (_, i) => (
        <Star
          key={i}
          className={`${starSize} ${
            i < Math.floor(rating)
              ? "fill-yellow-400 text-yellow-400"
              : i < rating
              ? "fill-yellow-400/50 text-yellow-400"
              : "text-gaming-border"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProductsClient() {
  const searchParams = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState("featured");
  const [showInStock, setShowInStock] = useState(false);
  const [showOnSale, setShowOnSale] = useState(false);
  const [minRating, setMinRating] = useState<number>(0);

  const [expandedParent, setExpandedParent] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    setPage(1);
  }, [
    selectedCategory,
    selectedBrands,
    priceRange,
    sortBy,
    showInStock,
    showOnSale,
    debouncedSearch,
    minRating,
    itemsPerPage,
  ]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const res = await fetch("/api/categories");
      if (!res.ok) throw new Error("Failed to fetch categories");
      const json = await res.json();
      return json.data ?? [];
    },
  });

  const categoryGroups = useMemo<CategoryGroup[]>(() => {
    const parentCats = categories.filter(
      (c) => !c.parentCategory || c.parentCategory === ""
    );
    const childCats = categories.filter(
      (c) => c.parentCategory && c.parentCategory !== ""
    );

    const groups: CategoryGroup[] = [];

    groups.push({ parent: null, children: categories });

    parentCats.forEach((parent) => {
      const children = childCats.filter(
        (c) => c.parentCategory === parent._id
      );
      if (children.length > 0) {
        groups.push({ parent, children });
      }
    });

    const orphanedChildren = childCats.filter((c) => {
      const parentExists = parentCats.some((p) => p._id === c.parentCategory);
      return !parentExists;
    });
    if (orphanedChildren.length > 0) {
      const unmatchedParent = categories.find(
        (c) => c.name.toLowerCase() === "other" || c.name.toLowerCase() === "uncategorized"
      );
      if (unmatchedParent) {
        const existingGroup = groups.find(
          (g) => g.parent?._id === unmatchedParent._id
        );
        if (existingGroup) {
          existingGroup.children.push(...orphanedChildren);
        } else {
          groups.push({ parent: unmatchedParent, children: orphanedChildren });
        }
      } else {
        groups.push({
          parent: { _id: "__uncategorized", name: "Other Categories", slug: "other", sortOrder: 999 },
          children: orphanedChildren,
        });
      }
    }

    return groups;
  }, [categories]);

  const { data: productsData, isLoading } = useQuery<{
    products: ProductCardData[];
    total: number;
    pages: number;
  }>({
    queryKey: [
      "products",
      selectedCategory,
      selectedBrands,
      priceRange,
      sortBy,
      showInStock,
      showOnSale,
      debouncedSearch,
      page,
      minRating,
      itemsPerPage,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedCategory) params.append("category", selectedCategory);
      if (selectedBrands.length) params.append("brand", selectedBrands[0]);
      params.append("minPrice", priceRange[0].toString());
      params.append("maxPrice", priceRange[1].toString());

      const sortMap: Record<string, string> = {
        featured: "createdAt",
        newest: "createdAt",
        "price-asc": "price",
        "price-desc": "price",
        popular: "views",
        "best-rated": "rating",
        "name-asc": "name",
      };
      const orderMap: Record<string, string> = {
        featured: "desc",
        newest: "desc",
        "price-asc": "asc",
        "price-desc": "desc",
        popular: "desc",
        "best-rated": "desc",
        "name-asc": "asc",
      };
      params.append("sort", sortMap[sortBy] || "createdAt");
      params.append("order", orderMap[sortBy] || "desc");

      if (showInStock) params.append("inStock", "true");
      if (showOnSale) params.append("filter", "sale");
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (minRating > 0) params.append("minRating", minRating.toString());
      params.append("page", page.toString());
      params.append("limit", itemsPerPage.toString());

      const res = await fetch(`/api/products?${params}`);
      if (!res.ok) throw new Error("Failed to fetch products");
      const json = await res.json();
      return {
        products: json.data ?? [],
        total: json.pagination?.total ?? 0,
        pages: json.pagination?.pages ?? 1,
      };
    },
  });

  const products = productsData?.products ?? [];
  const totalProducts = productsData?.total ?? 0;
  const totalPages = productsData?.pages ?? 1;

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) setSelectedCategory(categoryParam);
    const qParam = searchParams.get("q");
    if (qParam) setSearchQuery(qParam);
  }, [searchParams]);

  const clearFilters = useCallback(() => {
    setSelectedCategory("");
    setSelectedBrands([]);
    setPriceRange([0, 500]);
    setSortBy("featured");
    setShowInStock(false);
    setShowOnSale(false);
    setSearchQuery("");
    setMinRating(0);
  }, []);

  const toggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  }, []);

  const toggleParentExpand = useCallback((parentId: string) => {
    setExpandedParent((prev) => ({ ...prev, [parentId]: !prev[parentId] }));
  }, []);

  const hasActiveFilters =
    selectedCategory ||
    selectedBrands.length > 0 ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 500 ||
    showInStock ||
    showOnSale ||
    minRating > 0 ||
    debouncedSearch;

  const activeFilterCount =
    (selectedCategory ? 1 : 0) +
    selectedBrands.length +
    (priceRange[0] !== 0 || priceRange[1] !== 500 ? 1 : 0) +
    (showInStock ? 1 : 0) +
    (showOnSale ? 1 : 0) +
    (minRating > 0 ? 1 : 0) +
    (debouncedSearch ? 1 : 0);

  const activeCategoryName = categories.find(
    (c) => c._id === selectedCategory
  )?.name;

  const selectedCategoryObj = categories.find(
    (c) => c._id === selectedCategory
  );
  const parentCategoryName = selectedCategoryObj?.parentCategory
    ? categories.find((c) => c._id === selectedCategoryObj.parentCategory)?.name
    : null;

  const FilterContent = () => (
    <div className="space-y-0">
      {hasActiveFilters && (
        <div className="pb-4 border-b border-gaming-border/50">
          <button
            onClick={clearFilters}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gaming-dark/50 border border-gaming-border text-gaming-textMuted hover:text-neon-cyan hover:border-neon-cyan/50 transition-all text-sm font-medium"
          >
            <X className="w-4 h-4" />
            Clear All Filters
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-neon-cyan/10 text-neon-cyan text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      )}

      <CollapsibleSection title="Categories">
        <div className="space-y-0.5">
          <button
            onClick={() => setSelectedCategory("")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
              !selectedCategory
                ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 font-medium"
                : "text-gaming-textMuted hover:text-gaming-text hover:bg-white/5"
            }`}
          >
            All Products
          </button>

          {categoryGroups.map((group) => {
            if (!group.parent) return null;

            const isExpanded =
              expandedParent[group.parent._id] ?? false;
            const hasSelectedChild = group.children.some(
              (c) => c._id === selectedCategory
            );

            if (group.children.length === 0) return null;

            return (
              <div key={group.parent._id}>
                <button
                  onClick={() => toggleParentExpand(group.parent!._id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                    hasSelectedChild && !isExpanded
                      ? "text-neon-cyan"
                      : "text-gaming-text hover:bg-white/5"
                  }`}
                >
                  <span className="font-medium">
                    {group.parent.icon && (
                      <span className="mr-1.5">{group.parent.icon}</span>
                    )}
                    {group.parent.name}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-gaming-textMuted transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="pl-4 space-y-0.5">
                        {group.children.map((cat) => (
                          <button
                            key={cat._id}
                            onClick={() => setSelectedCategory(cat._id)}
                            className={`w-full text-left px-3 py-1.5 rounded-lg text-sm transition-all ${
                              selectedCategory === cat._id
                                ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20 font-medium"
                                : "text-gaming-textMuted hover:text-gaming-text hover:bg-white/5"
                            }`}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Brands"
        count={selectedBrands.length}
      >
        <div className="space-y-1">
          {BRANDS.map((brand) => (
            <div key={brand} className="flex items-center space-x-2.5 px-1">
              <Checkbox
                id={brand}
                checked={selectedBrands.includes(brand)}
                onCheckedChange={() => toggleBrand(brand)}
                className="border-gaming-border data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
              />
              <Label
                htmlFor={brand}
                className="text-sm text-gaming-textMuted cursor-pointer hover:text-gaming-text transition-colors flex-1"
              >
                {brand}
              </Label>
            </div>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Price Range"
        count={priceRange[0] !== 0 || priceRange[1] !== 500 ? 1 : 0}
      >
        <div className="space-y-3 px-1">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            min={0}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-xs text-gaming-textMuted">
            <span className="px-2 py-1 rounded bg-gaming-dark/50 border border-gaming-border">
              ${priceRange[0]}
            </span>
            <span className="text-gaming-border">—</span>
            <span className="px-2 py-1 rounded bg-gaming-dark/50 border border-gaming-border">
              ${priceRange[1]}
            </span>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection
        title="Rating"
        count={minRating > 0 ? 1 : 0}
      >
        <div className="space-y-1 px-1">
          {RATING_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() =>
                setMinRating(minRating === option.value ? 0 : option.value)
              }
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all ${
                minRating === option.value
                  ? "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20"
                  : "text-gaming-textMuted hover:text-gaming-text hover:bg-white/5"
              }`}
            >
              <StarRating rating={option.value} />
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Quick Filters">
        <div className="space-y-1 px-1">
          <div className="flex items-center space-x-2.5 py-1">
            <Checkbox
              id="inStock"
              checked={showInStock}
              onCheckedChange={(checked) => setShowInStock(checked as boolean)}
              className="border-gaming-border data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
            />
            <Label
              htmlFor="inStock"
              className="text-sm text-gaming-textMuted cursor-pointer hover:text-gaming-text transition-colors"
            >
              In Stock Only
            </Label>
          </div>
          <div className="flex items-center space-x-2.5 py-1">
            <Checkbox
              id="onSale"
              checked={showOnSale}
              onCheckedChange={(checked) => setShowOnSale(checked as boolean)}
              className="border-gaming-border data-[state=checked]:bg-neon-cyan data-[state=checked]:border-neon-cyan"
            />
            <Label
              htmlFor="onSale"
              className="text-sm text-gaming-textMuted cursor-pointer hover:text-gaming-text transition-colors"
            >
              On Sale
            </Label>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );

  return (
    <div className="page-container py-8 lg:py-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gaming-textMuted mb-6">
        <Link
          href="/"
          className="flex items-center gap-1 hover:text-gaming-text transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          Home
        </Link>
        <ChevronRightIcon className="w-3.5 h-3.5" />
        <Link href="/categories" className="hover:text-gaming-text transition-colors">
          Shop
        </Link>
        {parentCategoryName && (
          <>
            <ChevronRightIcon className="w-3.5 h-3.5" />
            <span className="text-gaming-textMuted">{parentCategoryName}</span>
          </>
        )}
        {activeCategoryName && (
          <>
            <ChevronRightIcon className="w-3.5 h-3.5" />
            <span className="text-neon-cyan">{activeCategoryName}</span>
          </>
        )}
      </nav>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl lg:text-4xl font-gaming font-bold text-white mb-2">
          Shop <span className="text-gradient">All Products</span>
        </h1>
        <p className="text-gaming-textMuted">
          {totalProducts} {totalProducts === 1 ? "product" : "products"} found
          {activeCategoryName && (
            <span className="text-neon-cyan ml-1">in {activeCategoryName}</span>
          )}
        </p>
      </div>

      {/* Search + Active Filters */}
      <div className="mb-6 space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gaming-textMuted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-10 pr-10 py-2.5 bg-gaming-surface border border-gaming-border rounded-xl text-gaming-text text-sm placeholder:text-gaming-textMuted/50 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/20 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gaming-textMuted hover:text-gaming-text transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            {selectedCategory && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-cyan/10 text-neon-cyan text-xs font-medium border border-neon-cyan/20">
                {activeCategoryName}
                <button
                  onClick={() => setSelectedCategory("")}
                  className="hover:bg-neon-cyan/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {selectedBrands.map((brand) => (
              <span
                key={brand}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-pink/10 text-neon-pink text-xs font-medium border border-neon-pink/20"
              >
                {brand}
                <button
                  onClick={() => toggleBrand(brand)}
                  className="hover:bg-neon-pink/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            {(priceRange[0] !== 0 || priceRange[1] !== 500) && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-green/10 text-neon-green text-xs font-medium border border-neon-green/20">
                ${priceRange[0]} – ${priceRange[1]}
                <button
                  onClick={() => setPriceRange([0, 500])}
                  className="hover:bg-neon-green/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-yellow-500/10 text-yellow-400 text-xs font-medium border border-yellow-500/20">
                <Star className="w-3 h-3 fill-yellow-400" />
                {minRating}+ Stars
                <button
                  onClick={() => setMinRating(0)}
                  className="hover:bg-yellow-500/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {showInStock && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-cyan/10 text-neon-cyan text-xs font-medium border border-neon-cyan/20">
                In Stock
                <button
                  onClick={() => setShowInStock(false)}
                  className="hover:bg-neon-cyan/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {showOnSale && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neon-pink/10 text-neon-pink text-xs font-medium border border-neon-pink/20">
                On Sale
                <button
                  onClick={() => setShowOnSale(false)}
                  className="hover:bg-neon-pink/20 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {debouncedSearch && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-gaming-text text-xs font-medium border border-gaming-border">
                &quot;{debouncedSearch}&quot;
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:bg-white/10 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-gaming-textMuted hover:text-neon-cyan underline underline-offset-2 transition-colors"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 bg-gaming-surface/50 backdrop-blur-xl border border-gaming-border rounded-2xl p-6 max-h-[calc(100vh-8rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gaming-border scrollbar-track-transparent">
            <FilterContent />
          </div>
        </aside>

        {/* Products Section */}
        <div className="lg:col-span-3">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                    {activeFilterCount > 0 && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-neon-cyan text-gaming-dark text-xs font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="bg-gaming-surface border-gaming-border w-80 p-0"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-white">Filters</h2>
                    </div>
                    <FilterContent />
                  </div>
                </SheetContent>
              </Sheet>

              <div className="hidden sm:flex items-center gap-1 bg-gaming-surface/50 rounded-lg p-1 border border-gaming-border">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "grid"
                      ? "bg-neon-cyan/10 text-neon-cyan"
                      : "text-gaming-textMuted hover:text-gaming-text"
                  }`}
                >
                  <Grid3x3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "list"
                      ? "bg-neon-cyan/10 text-neon-cyan"
                      : "text-gaming-textMuted hover:text-gaming-text"
                  }`}
                >
                  <Rows3 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Per Page */}
              <Select
                value={itemsPerPage.toString()}
                onValueChange={(v) => setItemsPerPage(Number(v))}
              >
                <SelectTrigger className="w-[80px] bg-gaming-surface/50 border-gaming-border text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gaming-surface border-gaming-border">
                  {PER_PAGE_OPTIONS.map((n) => (
                    <SelectItem key={n} value={n.toString()}>
                      {n} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px] sm:w-[200px] bg-gaming-surface/50 border-gaming-border text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gaming-surface border-gaming-border">
                  {SORT_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Products */}
          {isLoading ? (
            <div
              className={
                viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
                  : "space-y-4"
              }
            >
              {[...Array(itemsPerPage > 12 ? 12 : itemsPerPage)].map((_, i) =>
                viewMode === "grid" ? (
                  <div
                    key={i}
                    className="bg-gaming-surface/50 rounded-2xl p-4 animate-pulse border border-gaming-border"
                  >
                    <div className="aspect-square bg-gaming-dark rounded-xl mb-4" />
                    <div className="h-3 bg-gaming-dark rounded mb-2 w-1/3" />
                    <div className="h-4 bg-gaming-dark rounded mb-2" />
                    <div className="h-4 bg-gaming-dark rounded w-2/3 mb-3" />
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, j) => (
                        <div
                          key={j}
                          className="w-3.5 h-3.5 rounded bg-gaming-dark"
                        />
                      ))}
                      <span className="text-xs bg-gaming-dark rounded ml-1 w-8 h-3.5" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-gaming-dark rounded w-16" />
                      <div className="h-5 bg-gaming-dark rounded w-5" />
                    </div>
                  </div>
                ) : (
                  <div
                    key={i}
                    className="flex gap-4 bg-gaming-surface/50 rounded-2xl p-4 animate-pulse border border-gaming-border"
                  >
                    <div className="w-32 h-32 bg-gaming-dark rounded-xl flex-shrink-0" />
                    <div className="flex-1 space-y-3">
                      <div className="h-3 bg-gaming-dark rounded w-1/4" />
                      <div className="h-5 bg-gaming-dark rounded w-1/2" />
                      <div className="h-4 bg-gaming-dark rounded w-3/4" />
                      <div className="h-5 bg-gaming-dark rounded w-20" />
                    </div>
                  </div>
                )
              )}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-gaming-surface border border-gaming-border flex items-center justify-center">
                  <Package className="w-10 h-10 text-gaming-textMuted/30" />
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-gaming-dark border border-gaming-border flex items-center justify-center">
                  <Search className="w-4 h-4 text-gaming-textMuted/50" />
                </div>
              </div>
              <p className="text-gaming-text text-lg font-semibold mb-2">
                No products found
              </p>
              <p className="text-gaming-textMuted text-sm mb-6 max-w-sm mx-auto">
                We couldn&apos;t find any products matching your current filters.
                Try adjusting your search criteria.
              </p>
              {hasActiveFilters && (
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              )}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={`${viewMode}-${page}-${itemsPerPage}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6"
                    : "space-y-4"
                }
              >
                {products.map((product, index) => (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.02, duration: 0.3 }}
                  >
                    <ProductCard product={product} viewMode={viewMode} />
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1.5 mt-10">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2.5 rounded-xl border border-gaming-border text-gaming-textMuted hover:text-neon-cyan hover:border-neon-cyan/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {(() => {
                const pages: (number | "...")[] = [];
                if (totalPages <= 7) {
                  for (let i = 1; i <= totalPages; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (page > 4) pages.push("...");
                  const start = Math.max(2, page - 2);
                  const end = Math.min(totalPages - 1, page + 2);
                  for (let i = start; i <= end; i++) pages.push(i);
                  if (page < totalPages - 3) pages.push("...");
                  pages.push(totalPages);
                }

                return pages.map((p, i) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${i}`}
                      className="w-10 h-10 flex items-center justify-center text-gaming-textMuted text-sm"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition-all ${
                        page === p
                          ? "bg-neon-cyan text-gaming-dark shadow-lg shadow-neon-cyan/20"
                          : "border border-gaming-border text-gaming-textMuted hover:text-neon-cyan hover:border-neon-cyan/50"
                      }`}
                    >
                      {p}
                    </button>
                  )
                );
              })()}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2.5 rounded-xl border border-gaming-border text-gaming-textMuted hover:text-neon-cyan hover:border-neon-cyan/50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Results Summary */}
          {!isLoading && products.length > 0 && (
            <div className="mt-6 text-center text-xs text-gaming-textMuted">
              Showing {(page - 1) * itemsPerPage + 1}–
              {Math.min(page * itemsPerPage, totalProducts)} of {totalProducts}{" "}
              products
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
