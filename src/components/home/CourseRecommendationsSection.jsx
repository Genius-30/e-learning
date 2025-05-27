"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { InteractiveHoverButton } from "../magicui/interactive-hover-button";
import api from "@/utils/axiosInstance";
import CourseCard from "../cards/CourseCard";
import SkeletonCourseCard from "../skeletons/SkeletonCourseCard";
import { useAuth } from "@/context/AuthContext";

export default function CourseRecommendations() {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);

  const { accessToken } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const response = await api.get("/user/recommended-courses", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setCourses(response.data.courses);
      } catch (err) {
        console.error("Error fetching courses:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [accessToken]);

  return (
    <section className="w-full lg:max-w-[80%] mx-auto mt-20 sm:mt-28">
      <h2 className="text-3xl sm:text-4xl font-bold text-center text-primary">
        Recommended Courses
      </h2>
      <p className="text-lg text-muted-foreground text-center mt-2">
        Explore our top-rated courses designed to boost your skills.
      </p>

      <div className="w-full text-center grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
        {loading
          ? Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCourseCard key={index} />
            ))
          : courses.map((course) => (
              <CourseCard key={course._id} course={course} />
            ))}

        {!loading && courses.length === 0 && (
          <div className="text-center mt-10 text-muted-foreground">
            No recommended courses available at the moment.
          </div>
        )}
      </div>

      {/* Explore More Courses Button */}
      <div className="flex justify-center mt-10">
        <InteractiveHoverButton
          className="px-6 py-3 text-lg font-semibold hover:text-gray-50 "
          onClick={() => router.push("/courses")}
        >
          Explore Courses
        </InteractiveHoverButton>
      </div>
    </section>
  );
}
