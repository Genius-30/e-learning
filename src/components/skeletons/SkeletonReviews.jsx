import { Skeleton } from "@heroui/react";

export default function SkeletonReview() {
  return (
    <div className="flex flex-col gap-2 border border-card rounded-xl p-4 bg-muted/50 animate-pulse">
      {/* Avatar + Name */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-24 rounded" />
          {/* Stars */}
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-4 w-4 rounded" />
            ))}
          </div>
        </div>
      </div>

      {/* Comment */}
      <Skeleton className="h-3 w-full rounded" />
      <Skeleton className="h-3 w-5/6 rounded" />
    </div>
  );
}
