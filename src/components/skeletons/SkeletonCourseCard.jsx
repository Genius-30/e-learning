import { Skeleton } from "@heroui/react";
import React from "react";

function SkeletonCourseCard() {
  return (
    <div className="bg-card border border-border shadow-md rounded-lg p-4 space-y-3">
      <Skeleton className="w-full h-48 rounded-md" />
      <Skeleton className="w-3/4 h-6" />
      <Skeleton className="w-1/2 h-4" />
      <Skeleton className="w-full h-4" />
      <Skeleton className="w-1/2 h-4" />
    </div>
  );
}

export default SkeletonCourseCard;
