"use client";

export default function CartLoading() {
  return (
    <div className="page-container py-12">
      <div className="h-8 w-32 bg-gaming-surface rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="gaming-card p-4 flex gap-4 animate-pulse">
              <div className="w-20 h-20 bg-gaming-dark rounded-lg" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gaming-surface rounded w-2/3" />
                <div className="h-3 bg-gaming-surface rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
        <div className="gaming-card p-6 animate-pulse">
          <div className="h-6 bg-gaming-surface rounded w-1/2 mb-4" />
          <div className="space-y-2">
            <div className="h-4 bg-gaming-surface rounded" />
            <div className="h-4 bg-gaming-surface rounded" />
            <div className="h-4 bg-gaming-surface rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
