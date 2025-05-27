import api from "@/utils/axiosInstance";
import { addToast, Button, Skeleton, Textarea } from "@heroui/react";
import { useEffect, useState } from "react";
import { FaRegStar, FaStar } from "react-icons/fa";
import ReviewItem from "../review/reviewItem";
import SkeletonReview from "../skeletons/SkeletonReviews";
import SkeletonWriteReview from "../skeletons/SkeletonWriteReview";

function getStarIcons(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} className="text-yellow-400" />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} className="text-yellow-400" />);
    } else {
      stars.push(<FaRegStar key={i} className="text-yellow-400" />);
    }
  }
  return stars;
}

export default function ReviewsSection({
  courseId,
  accessToken,
  user,
  className,
}) {
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 0, comment: "" });
  const [hasReviewed, setHasReviewed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get(`/user/courses/${courseId}/reviews`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const { reviews, averageRating, totalReviews } = res.data;
        setReviews(reviews);
        setAverageRating(averageRating);
        setTotalReviews(totalReviews);

        // Check if current user has reviewed
        setHasReviewed(
          reviews.length > 0 && reviews[0]?.userId._id === user._id
        );
      } catch (error) {
        console.error("Error fetching reviews:", error);
        addToast({
          title: "Error",
          description: "Failed to fetch reviews. Please try again later.",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId && accessToken && user) {
      fetchReviews();
    }
  }, [courseId, accessToken, user]);

  const handleReviewSubmit = async () => {
    if (!newReview.rating) {
      setError("Please select a rating.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      await api.post(`/user/courses/${courseId}/reviews`, newReview, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      addToast({
        title: "Success",
        description: "Your review has been submitted!",
        color: "success",
      });

      // Re-fetch reviews
      setNewReview({ rating: 0, comment: "" });
      setHasReviewed(true);
      setLoading(true);
      const res = await api.get(`/user/courses/${courseId}/reviews`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const { reviews, averageRating, totalReviews } = res.data;
      setReviews(reviews);
      setAverageRating(averageRating);
      setTotalReviews(totalReviews);
    } catch (error) {
      console.error("Error submitting review:", error);
      addToast({
        title: "Error",
        description:
          error?.response?.data?.message ||
          "Could not submit your review. Try again.",
        color: "danger",
      });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-40 rounded" />
          <div className="flex gap-1">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-5 w-5 rounded" />
            ))}
          </div>
        </div>
        <Skeleton className="h-4 w-28 rounded" />

        {/* Form Skeleton */}
        <SkeletonWriteReview />

        {/* Reviews Skeleton */}
        <div className="space-y-3">
          <SkeletonReview />
          <SkeletonReview />
          <SkeletonReview />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 px-2 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Average Rating: {averageRating}/5</h2>
        <div className="flex">{getStarIcons(averageRating)}</div>
      </div>

      <p className="text-sm text-muted-foreground">
        Total Reviews: {totalReviews}
      </p>

      {!hasReviewed && (
        <div className="border border-card p-4 rounded-xl bg-muted/50 space-y-4">
          <h3 className="font-semibold">Write a Review</h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setNewReview({ ...newReview, rating: star })}
              >
                {newReview.rating >= star ? (
                  <FaStar className="text-yellow-400 text-xl" />
                ) : (
                  <FaRegStar className="text-yellow-400 text-xl" />
                )}
              </button>
            ))}
          </div>
          <Textarea
            placeholder="Write your review..."
            value={newReview.comment}
            className="resize-none"
            classNames={{
              input: "outline-none border-none",
            }}
            onChange={(e) =>
              setNewReview({ ...newReview, comment: e.target.value })
            }
          />
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <Button
            onPress={handleReviewSubmit}
            isDisabled={submitting}
            isLoading={submitting}
            className="w-full"
            color="primary"
          >
            Submit Review
          </Button>
        </div>
      )}

      <div className="space-y-3">
        {reviews?.map((review, i) => (
          <ReviewItem
            key={review._id}
            review={review}
            currentUserId={user._id}
          />
        ))}
      </div>
    </div>
  );
}
