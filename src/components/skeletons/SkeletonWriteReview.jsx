import { Skeleton } from "@heroui/react";

export default function SkeletonWriteReview() {
  return (
    <div className="border border-card p-4 rounded-xl bg-muted/50 space-y-4 animate-pulse">
      {/* Title */}
      <Skeleton className="h-4 w-28 rounded" />

      {/* Stars */}
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-5 w-5 rounded" />
        ))}
      </div>

      {/* Textarea */}
      <Skeleton className="h-20 w-full rounded" />

      {/* Submit Button */}
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
  );
}
