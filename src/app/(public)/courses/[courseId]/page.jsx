"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import CourseHeader from "@/components/courses/course/CourseHeader";
import CoursePreview from "@/components/courses/course/CoursePreview";
import { useAuth } from "@/context/AuthContext";
import { Skeleton, useDisclosure } from "@heroui/react";
import CourseCurriculum from "@/components/courses/course/CourseCurriculum";
import ReviewsSection from "@/components/review/ReviewsSection";

export default function CourseDetailsPage() {
  const [courseData, setCourseData] = useState(null);
  const [sectionsResponse, setSectionsResponse] = useState([]);
  const [previewLectures, setPreviewLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPreview, setSelectedPreview] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const { accessToken, user } = useAuth();
  const { courseId } = useParams();

  const handlePreviewClick = (lecture) => {
    setSelectedPreview(lecture);
    onOpen();
  };

  // Fetch course details, sections, and reviews
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        };

        // Fetch basic course details
        const courseResponse = await axios.get(
          `/api/courses/${courseId}`,
          config
        );
        setCourseData(courseResponse.data);

        // Fetch sections, lectures, preview lectures
        const sectionsResponse = await axios.get(
          `/api/courses/${courseId}/sections`,
          config
        );
        setSectionsResponse(sectionsResponse.data);
        setPreviewLectures(sectionsResponse.data.previewLectures);
      } catch (error) {
        console.error("Error fetching course data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourseData();
  }, [courseId, accessToken]);

  return (
    <div className="w-full md:max-w-[80%] mx-auto flex flex-col items-center py-8 px-6">
      <div className="w-full flex flex-col lg:flex-row items-center justify-start gap-8">
        <CoursePreview
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          thumbnail={courseData?.thumbnail}
          previewLectures={previewLectures}
          loading={loading}
          selectedPreview={selectedPreview}
        />
        <CourseHeader courseData={courseData} loading={loading} />
      </div>

      {/* Course Description */}
      <div className="w-full self-start mt-10">
        <h2 className="text-2xl font-semibold mb-4">Description</h2>
        {loading || !courseData ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-6 w-[90%] rounded-md" />
            <Skeleton className="h-6 w-[80%] rounded-md" />
          </div>
        ) : (
          <>
            {/* Truncate the description initially */}
            <p className="text-md">
              {(() => {
                if (isExpanded) {
                  return courseData?.description;
                }
                if (courseData?.description.length > 300) {
                  return `${courseData?.description.slice(0, 300)}...`;
                }
                return courseData?.description;
              })()}
            </p>

            {/* Button to toggle the full description */}
            {!isExpanded && courseData?.description.length > 100 && (
              <button
                className="text-blue-500 text-sm mt-2 cursor-pointer"
                onClick={() => setIsExpanded(true)}
              >
                Show More
              </button>
            )}

            {isExpanded && (
              <button
                className="text-blue-500 text-sm mt-2 cursor-pointer"
                onClick={() => setIsExpanded(false)}
              >
                Show Less
              </button>
            )}
          </>
        )}
      </div>

      {/* Curriculum Section */}
      <CourseCurriculum
        loading={loading}
        sectionsResponse={sectionsResponse}
        onPreviewClick={handlePreviewClick}
      />

      <ReviewsSection
        courseId={courseId}
        accessToken={accessToken}
        user={user}
        className={"w-full self-start mt-10"}
      />
    </div>
  );
}
