import { Card, CardBody, CardFooter, Skeleton } from "@heroui/react";

function EnrolledCourseCardSkeleton({ index }) {
  return (
    <Card
      key={index}
      shadow="sm"
      className="bg-transparent border border-card shadow-none hover:scale-[1.02] hover:shadow-lg transition-transform duration-300 ease-in-out"
    >
      {/* Thumbnail Skeleton */}
      <CardBody className="p-0 border-b border-card overflow-hidden">
        <Skeleton className="w-full h-[200px] rounded-t-lg" />
      </CardBody>

      {/* Info Skeleton */}
      <CardFooter className="flex flex-col items-start text-sm p-4 gap-3">
        {/* Title + Badge Placeholder */}
        <div className="flex justify-between w-full items-start">
          <Skeleton className="h-4 w-2/3 rounded-lg bg-default-200" />
          <Skeleton className="h-4 w-1/4 rounded-full bg-default-200" />
        </div>

        {/* Last Watched Placeholder */}
        <Skeleton className="h-3 w-full rounded bg-default-200" />

        {/* Progress Bar Skeleton */}
        <Skeleton className="h-2 w-full rounded bg-default-200 mt-1" />

        {/* Action Button Skeleton */}
        <Skeleton className="h-9 w-full rounded-lg bg-default-200" />
      </CardFooter>
    </Card>
  );
}

export default EnrolledCourseCardSkeleton;
