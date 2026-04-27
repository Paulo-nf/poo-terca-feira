export function SkeletonCard() {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden shadow-sm">
      <div className="w-full aspect-video bg-gradient-to-r from-surface2 via-border to-surface2 bg-[length:500px_100%] animate-shimmer" />
      <div className="p-5 pt-[18px]">
        <div className="flex justify-between mb-3">
          <div className="h-6 w-20 bg-gradient-to-r from-surface2 via-border to-surface2 bg-[length:500px_100%] animate-shimmer rounded-full" />
          <div className="h-12 w-12 bg-gradient-to-r from-surface2 via-border to-surface2 bg-[length:500px_100%] animate-shimmer rounded-[10px]" />
        </div>
        <div className="h-5 w-3/4 bg-gradient-to-r from-surface2 via-border to-surface2 bg-[length:500px_100%] animate-shimmer rounded mb-2" />
        <div className="h-4 w-full bg-gradient-to-r from-surface2 via-border to-surface2 bg-[length:500px_100%] animate-shimmer rounded mb-4" />
        <div className="flex justify-between pt-3.5 border-t border-border">
          <div className="h-8 w-24 bg-gradient-to-r from-surface2 via-border to-surface2 bg-[length:500px_100%] animate-shimmer rounded" />
          <div className="h-9 w-20 bg-gradient-to-r from-surface2 via-border to-surface2 bg-[length:500px_100%] animate-shimmer rounded-[10px]" />
        </div>
      </div>
    </div>
  );
}
