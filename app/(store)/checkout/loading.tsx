"use client";

export default function CheckoutLoading() {
  return (
    <div className="page-container py-12">
      <div className="h-8 w-64 bg-gaming-surface rounded mb-8 animate-pulse" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 gaming-card p-6 animate-pulse">
          <div className="h-6 bg-gaming-surface rounded w-1/3 mb-6" />
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-gaming-dark rounded" />
            ))}
          </div>
        </div>
        <div className="gaming-card p-6 animate-pulse">
          <div className="h-6 bg-gaming-surface rounded w-1/2 mb-4" />
          <div className="space-y-3">
            <div className="h-4 bg-gaming-surface rounded" />
            <div className="h-4 bg-gaming-surface rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
