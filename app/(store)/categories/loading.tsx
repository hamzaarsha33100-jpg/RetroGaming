"use client";

export default function CategoriesLoading() {
  return (
    <div className="page-container py-12">
      <div className="h-8 w-48 bg-gaming-surface rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="gaming-card p-4 animate-pulse">
            <div className="aspect-video bg-gaming-dark rounded-lg mb-4" />
            <div className="h-4 bg-gaming-surface rounded w-3/4 mb-2" />
            <div className="h-3 bg-gaming-surface rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
