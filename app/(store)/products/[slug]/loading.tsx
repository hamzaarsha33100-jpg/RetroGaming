"use client";

export default function ProductLoading() {
  return (
    <div className="page-container py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="aspect-square bg-gaming-surface rounded-lg animate-pulse" />
        <div className="space-y-4">
          <div className="h-4 bg-gaming-surface rounded w-1/4 animate-pulse" />
          <div className="h-8 bg-gaming-surface rounded w-3/4 animate-pulse" />
          <div className="h-4 bg-gaming-surface rounded w-1/2 animate-pulse" />
          <div className="h-12 bg-gaming-surface rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}
