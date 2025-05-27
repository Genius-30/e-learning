"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import LecturePlayer from "@/components/learn/LecturePlayer";
import ReviewsSection from "@/components/review/ReviewsSection";
import CourseOverview from "@/components/learn/CourseOverview";
import CourseNotes from "@/components/learn/CourseNotes";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/axiosInstance";
import { addToast, Tab, Tabs } from "@heroui/react";
import { useIsMobile } from "@/hooks/use-mobile";
import CourseContent from "@/components/learn/CourseContent";

export default function LearnPage() {
  const router = useRouter();
  const { courseId } = useParams();

  const isMobile = useIsMobile();

  useEffect(() => {
    if (!courseId) {
      router.replace("/courses");
    }
  }, [courseId, router]);

  const { user, accessToken } = useAuth();

  const [selectedLectureId, setSelectedLectureId] = useState(null);

  const config = {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  };

  useEffect(() => {
    const fetchDefaultLectureId = async () => {
      try {
        const res = await api.get(
          `/user/enrollments/${courseId}/last-lecture`,
          config
        );
        setSelectedLectureId(res.data?.lastLectureId);
      } catch (err) {
        console.error("Failed to get default lecture ID", err);
        router.push("/courses");
      }
    };

    if (user && accessToken && courseId) {
      fetchDefaultLectureId();
    }
  }, [courseId, accessToken, user, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await api.get(`/user/enrollments/${courseId}`, config);
      } catch (error) {
        console.error("Error fetching course data:", error);

        addToast({
          title: "Failed to load course content",
          description:
            error?.response?.data?.message ||
            "Something went wrong. Please try again.",
          variant: "danger",
        });
        if (error?.response?.status === 403) {
          addToast({
            title: "Access Denied",
            description: "You do not have permission to access this course.",
            variant: "danger",
          });
        }
        router.push("/my-learnings");
      }
    };

    if (user && accessToken && courseId) {
      fetchData();
    }
  }, [courseId, accessToken, user, router]);

  const courseContentProps = {
    courseId,
    accessToken,
    selectedLectureId,
    setSelectedLectureId,
  };

  return (
    <main className="min-h-[calc(100vh-80px)] w-full md:max-w-[80%] mx-auto bg-background text-text p-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Left/Main Area */}
        <div className="md:col-span-8 space-y-6">
          <LecturePlayer lectureId={selectedLectureId} />

          <Tabs variant="underlined">
            <Tab key="overview" title="Overview">
              <CourseOverview courseId={courseId} accessToken={accessToken} />
            </Tab>
            <Tab key="notes" title="Notes">
              <CourseNotes courseId={courseId} accessToken={accessToken} />
            </Tab>
            <Tab key="reviews" title="Reviews">
              <ReviewsSection
                courseId={courseId}
                accessToken={accessToken}
                user={user}
                className={"px-2"}
              />
            </Tab>
            {isMobile && (
              <Tab key="course-content" title="Course Content">
                <CourseContent {...courseContentProps} />
              </Tab>
            )}
          </Tabs>
        </div>

        {/* Sidebar for large screens only */}
        <div className="md:col-span-4 hidden md:block space-y-4">
          <CourseContent {...courseContentProps} />
        </div>
      </div>
    </main>
  );
}
