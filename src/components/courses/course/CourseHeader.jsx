"use client";

import { addToast, Button, Skeleton, useDisclosure } from "@heroui/react";
import dayjs from "dayjs";
import { UsersIcon } from "lucide-react";
import { useState } from "react";
import PurchaseConfirmationModal from "./PurchaseConfirmationModal";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function CourseHeader({ loading, courseData }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedPurchaseType, setSelectedPurchaseType] = useState(null);
  const [isPurchasing, setIsPurchasing] = useState(false);

  const router = useRouter();
  const { user } = useAuth();

  const formatDate = (date) => dayjs(date).format("MMMM YYYY");

  const handleBuyClick = (type) => {
    if (!user) {
      addToast({
        title: "Login Required",
        description: "Please login to buy the course.",
        color: "warning",
      });
      return;
    }

    if (purchased) {
      router.push(`/courses/${courseData._id}/learn`);
      return;
    }

    setSelectedPurchaseType(type);
    onOpen();
  };

  if (loading || !courseData) {
    return (
      <div className="w-full self-start lg:mt-6 space-y-3">
        <Skeleton className="h-10 w-[80%] rounded-md" /> {/* Title */}
        <Skeleton className="h-5 w-[70%] rounded-md" />
        <Skeleton className="h-5 w-[70%] rounded-md" />
        {/* Category + updated date */}
        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {/* Skeleton Card for Online */}
          <div className="border border-card rounded-lg p-4 flex-1 space-y-3 shadow-md">
            <Skeleton className="h-8 w-36 rounded-md" /> {/* Card Title */}
            <Skeleton className="h-6 w-20 rounded-md" /> {/* Price */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24 rounded-md" /> {/* Enrolled */}
            </div>
            <Skeleton className="h-10 w-full rounded-md mt-2" /> {/* Button */}
          </div>

          {/* Skeleton Card for Hybrid */}
          <div className="border border-card rounded-lg p-4 flex-1 space-y-3 shadow-md">
            <Skeleton className="h-8 w-36 rounded-md" /> {/* Card Title */}
            <Skeleton className="h-6 w-20 rounded-md" /> {/* Price */}
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-24 rounded-md" /> {/* Enrolled */}
            </div>
            <Skeleton className="h-10 w-full rounded-md mt-2" /> {/* Button */}
          </div>
        </div>
      </div>
    );
  }

  const {
    title,
    category,
    createdAt,
    updatedAt,
    totalWeeks,
    totalHours,
    purchases,
    price,
    purchased,
  } = courseData;

  return (
    <div className="w-full self-start lg:mt-6 space-y-3">
      <h1 className="text-3xl lg:text-4xl font-bold">{title}</h1>

      <p className="text-md font-semibold text-zinc-400 text-muted-foreground">
        {category} · Last updated:{" "}
        {formatDate(updatedAt !== createdAt ? updatedAt : createdAt)}
      </p>

      <p className="text-md font-semibold text-zinc-400 text-muted-foreground">
        Total Weeks: {totalWeeks} · Total Hours: {totalHours}
      </p>

      {!purchased ? (
        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          {/* Online Card */}
          <div className="border border-card rounded-lg p-4 flex-1 space-y-3 shadow-md">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              Online
            </h2>
            <p className="text-lg font-bold">₹{price.online.finalPrice}</p>
            {price.online.finalPrice < price.online.original && (
              <div className="flex items-center gap-2 text-sm">
                <span className="line-through text-muted-foreground">
                  ₹{price.online.original}
                </span>
                <span className="text-green-600 font-semibold">
                  {price.online.discountPercentage}% Off
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <UsersIcon size={16} />
              <span>Enrolled:</span>
              <span className="font-medium text-foreground ml-1">
                {purchases.online}
              </span>
            </div>
            <Button
              onPress={() => handleBuyClick("online")}
              isDisabled={isPurchasing}
              isLoading={isPurchasing}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 mt-2"
            >
              Buy Online
            </Button>
          </div>

          {/* Hybrid Card */}
          <div className="border border-card rounded-lg p-4 flex-1 space-y-3 shadow-md">
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
              Hybrid
            </h2>
            <p className="text-lg font-bold">₹{price.hybrid.finalPrice}</p>
            {price.hybrid.finalPrice < price.hybrid.original && (
              <div className="flex items-center gap-2 text-sm">
                <span className="line-through text-muted-foreground">
                  ₹{price.hybrid.original}
                </span>
                <span className="text-green-600 font-semibold">
                  {price.hybrid.discountPercentage}% Off
                </span>
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <UsersIcon size={16} />
              <span>Enrolled:</span>
              <span className="font-medium text-foreground ml-1">
                {purchases.hybrid}
              </span>
            </div>
            <Button
              onPress={() => handleBuyClick("hybrid")}
              isDisabled={isPurchasing}
              isLoading={isPurchasing}
              className="w-full text-white bg-blue-600 hover:bg-blue-700 mt-2"
            >
              Buy Hybrid
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <Button
            onPress={() => router.push(`/courses/${courseData._id}/learn`)}
            className="w-full text-white bg-blue-600 hover:bg-blue-700"
          >
            Start Learning
          </Button>
        </div>
      )}

      {selectedPurchaseType && (
        <PurchaseConfirmationModal
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          courseData={courseData}
          selectedPurchaseType={selectedPurchaseType}
          setSelectedPurchaseType={setSelectedPurchaseType}
          isPurchasing={isPurchasing}
          setIsPurchasing={setIsPurchasing}
        />
      )}
    </div>
  );
}
