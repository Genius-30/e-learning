"use client";

import { useEffect, useState } from "react";
import api from "@/utils/axiosInstance";
import { addToast } from "@heroui/react";
import { useAuth } from "@/context/AuthContext";
import EnrolledCourseCardSkeleton from "@/components/skeletons/EnrolledCourseCardSkeleton";
import EnrolledCourseCard from "@/components/cards/EnrollementCard";

const MyLearningsPage = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const { accessToken } = useAuth();

  useEffect(() => {
    if (!accessToken) return;

    const fetchLearnings = async () => {
      try {
        const { data } = await api.get("/user/enrollments", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setEnrollments(data.enrollments);
      } catch (error) {
        console.error("Failed to fetch enrollments:", error);
        addToast({
          title: "Error",
          description: "Failed to fetch your courses. Please try again later.",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchLearnings();
  }, [accessToken]);

  return (
    <main className="min-h-[calc(100vh-80px)] w-full lg:max-w-[80%] mx-auto bg-background text-text p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <EnrolledCourseCardSkeleton key={index} />
            ))
          : enrollments.length === 0 && (
              <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center p-4 bg-card rounded-lg shadow-md">
                <h2 className="text-lg font-semibold mb-2">
                  No Enrollments Found
                </h2>
                <p className="text-sm text-muted-foreground">
                  You have not enrolled in any courses yet. Explore our catalog
                  and start learning today!
                </p>
              </div>
            )}

        {enrollments.map((enroll) => (
          <EnrolledCourseCard key={enroll._id} enroll={enroll} />
        ))}
      </div>
    </main>
  );
};

export default MyLearningsPage;
