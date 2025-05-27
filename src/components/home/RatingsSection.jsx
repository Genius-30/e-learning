"use client";

import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";
import api from "@/utils/axiosInstance";
import { Skeleton } from "@heroui/react";
import { useEffect, useState } from "react";

export function RatingsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReviews() {
      try {
        const res = await api.get("/reviews/highlighted");
        console.log(res.data);

        const fetched = res.data.reviews || [];

        // Map the fetched data to match expected props
        const formatted = fetched.map((review) => ({
          quote: review.comment || "",
          name: review.name || "Anonymous",
          designation: "Learner", // default or dynamic if available
          rating: review.rating || 0,
          src: review.src,
        }));

        setTestimonials(formatted);
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-sm px-4 py-20 font-sans antialiased md:max-w-4xl md:px-8 lg:px-12 mt-20 sm:mt-28">
        <div className="grid grid-cols-1 gap-20 md:grid-cols-2">
          <div className="h-80 w-full">
            <Skeleton className="h-full w-auto aspect-square rounded-3xl object-cover" />
          </div>
          <div className="flex flex-col justify-between py-4">
            <div className="space-y-4">
              <Skeleton className="h-6 w-3/4 rounded-md" />{" "}
              {/* Testimonial name */}
              <Skeleton className="h-4 w-1/2 rounded-md" /> {/* Designation */}
              <div className="flex space-x-1">
                <Skeleton className="h-4 w-6 rounded-md" />{" "}
                {/* Star rating placeholder */}
                <Skeleton className="h-4 w-6 rounded-md" />
                <Skeleton className="h-4 w-6 rounded-md" />
                <Skeleton className="h-4 w-6 rounded-md" />
                <Skeleton className="h-4 w-6 rounded-md" />
              </div>
              {/* Placeholder for quote */}
              <Skeleton className="h-4 w-full rounded-md" />{" "}
              <Skeleton className="h-4 w-2/3 rounded-md" />{" "}
            </div>
            <div className="flex gap-4 pt-12 md:pt-0">
              <Skeleton className="h-6 w-6 rounded-full" />
              <Skeleton className="h-6 w-6 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (testimonials.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-muted-foreground">
          No reviews available at the moment.
        </p>
      </div>
    );
  }

  return <AnimatedTestimonials testimonials={testimonials} />;
}
