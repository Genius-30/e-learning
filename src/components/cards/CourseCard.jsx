import React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardFooter } from "@heroui/react";
import { FaRegStar, FaStar, FaStarHalfAlt } from "react-icons/fa";

const CourseCard = ({ course }) => {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/courses/${course._id}`);
  };

  const getStars = (rating) => {
    const filledStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - filledStars - halfStar;

    const stars = [];

    // Add filled stars (yellow)
    for (let i = 0; i < filledStars; i++) {
      stars.push(
        <FaStar key={`filled-${i}`} size={18} className="text-yellow-400" />
      );
    }

    // Add half star (if applicable)
    if (halfStar === 1) {
      stars.push(
        <FaStarHalfAlt key="half" size={18} className="text-yellow-400" />
      );
    }

    // Add empty stars (gray)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FaRegStar key={`empty-${i}`} size={18} className="text-yellow-300" />
      );
    }

    return <>{stars}</>;
  };

  return (
    <Card
      isPressable
      shadow="sm"
      onPress={handleCardClick}
      className="cursor-pointer bg-transparent border border-card shadow-none hover:scale-[1.02] hover:shadow-lg transition-shadow duration-300 ease-in-out data-[pressed=true]:scale-100"
    >
      {/* Course Thumbnail */}
      <CardBody className="p-0 border border-card overflow-hidden">
        <div className="relative w-full h-[200px]">
          <Image
            src={course.thumbnail}
            alt={course.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        </div>
      </CardBody>

      {/* Course Info */}
      <CardFooter className="flex flex-col items-start text-small p-4">
        {/* Course Title */}
        <h3 className="text-xl font-semibold truncate text-wrap text-start">
          {course.title}
        </h3>
        {/* Course Category */}
        <p className="text-sm text-gray-500 mt-1">{course.category}</p>

        {/* Rating */}
        <div className="flex items-center mt-2">
          <span className="flex">{getStars(course.averageRating)}</span>
          <span className="ml-2 text-sm text-gray-500">
            ({course.reviewCount} reviews)
          </span>
        </div>

        {/* Duration and Hours */}
        <div className="flex mt-2 text-sm text-gray-600">
          <span>{course.durationWeeks} Weeks</span>
          <span className="mx-2">•</span>
          <span>{course.totalHours} Hours</span>
        </div>

        {/* Price Section */}
        <div className="w-full flex justify-between mt-4">
          {/* Online Price */}
          <div className="flex flex-col items-start">
            <span className="text-lg font-semibold">Online Price:</span>
            <div className="flex items-center">
              <span className="text-lg font-bold text-success">
                ₹{course.purchaseOptions.online.finalPrice}
              </span>
              {course.purchaseOptions.online.discount?.percentage > 0 &&
                new Date(course.purchaseOptions.online.discount.validUntil) >
                  new Date() && (
                  <span className="line-through text-sm text-gray-500 ml-2">
                    ₹{course.purchaseOptions.online.price}
                  </span>
                )}
            </div>
          </div>

          {/* Hybrid Price (if available) */}
          {course.purchaseOptions?.hybrid && (
            <div className="flex flex-col items-start">
              <span className="text-lg font-semibold">Hybrid Price:</span>
              <div className="flex items-center">
                <span className="text-lg font-bold text-blue">
                  ₹{course.purchaseOptions.hybrid.finalPrice}
                </span>
                {course.purchaseOptions.hybrid.discount?.percentage > 0 &&
                  new Date(course.purchaseOptions.hybrid.discount.validUntil) >
                    new Date() && (
                    <span className="line-through text-sm text-gray-500 ml-2">
                      ₹{course.purchaseOptions.hybrid.price}
                    </span>
                  )}
              </div>
            </div>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default CourseCard;
