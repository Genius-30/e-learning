"use client";

import { useEffect, useState } from "react";
import EnrolledCourseCardSkeleton from "../skeletons/EnrolledCourseCardSkeleton";
import { Button } from "@heroui/react";
import api from "@/utils/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import EnrolledCourseCard from "../cards/EnrollementCard";

const EnrolledCoursesSection = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);

  const { accessToken } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) return;
    async function fetchEnrolledCourses() {
      try {
        const response = await api.get("/user/enrollments", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setEnrollments(response.data.enrollments);
      } catch (error) {
        console.error("Error fetching enrolled courses:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchEnrolledCourses();
  }, [accessToken]);

  return (
    <section className="w-full py-10 mt-10">
      <h2 className="text-2xl font-semibold text-[var(--color-text)]">
        Enrolled Courses
      </h2>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => (
              <EnrolledCourseCardSkeleton key={index} />
            ))
          : enrollments.map((enroll) => (
              <EnrolledCourseCard key={enroll._id} enroll={enroll} />
            ))}
      </div>

      {!loading && enrollments.length > 0 && (
        <Button
          variant="ghost"
          color="primary"
          className="mt-6 w-[120px] sm:w-[150px] border-border-color text-text hover:border-transparent"
          onPress={() => router.push("/my-learnings")}
        >
          View All
        </Button>
      )}

      {!loading && enrollments.length === 0 && (
        <div className="text-center text-muted-foreground mt-10">
          <p className="text-lg font-medium">No courses enrolled yet</p>
          <p className="text-sm mt-1">
            Start exploring and enroll in your first course today!
          </p>
          <Button
            className="mt-4"
            variant="shadow"
            color="primary"
            onPress={() => router.push("/courses")}
          >
            Browse Courses
          </Button>
        </div>
      )}
    </section>
  );
};

export default EnrolledCoursesSection;
