"use client";
import api from "@/utils/axiosInstance";
import {
  addToast,
  Button,
  cn,
  Skeleton,
  Switch,
  useDisclosure,
} from "@heroui/react";
import { FilePenIcon, RocketIcon } from "lucide-react";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import ConfirmStatusModal from "./ConfirmStatusModal";

function PublishCourse() {
  const [course, setCourse] = useState({});
  const [status, setStatus] = useState(false);
  const [originalStatus, setOriginalStatus] = useState(false);
  const [loading, setLoading] = useState(false);
  const { courseId } = useParams();
  const { isOpen, onOpenChange } = useDisclosure();

  // Fetch course data
  useEffect(() => {
    const fetchCourse = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/admin/courses/${courseId}/overview`);
        const courseData = res.data;
        setCourse(courseData);
        setOriginalStatus(courseData.status === "published");
        setStatus(courseData.status === "published");
      } catch (err) {
        console.error("Failed to fetch course overview:", err);
        addToast({
          title: "Error",
          description: "Failed to fetch course overview.",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  function formatDuration(hours) {
    if (typeof hours !== "number" || isNaN(hours)) return "N/A";

    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    } else {
      return `${hours.toFixed(1)} hrs`;
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Publish Your Course</h1>

      {loading ? (
        <div className="rounded-2xl border border-card p-4 shadow-md space-y-4">
          <div className="aspect-video w-[50%] overflow-hidden rounded-xl">
            <Skeleton className="w-full h-full" />
          </div>

          <div>
            <Skeleton className="w-1/2 h-6 mb-2 rounded-md" />
            <Skeleton className="w-full h-4 rounded-md" />
            <Skeleton className="w-4/5 h-4 mt-1 rounded-md" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <Skeleton className="w-3/4 h-4 rounded-md" />
              <Skeleton className="w-2/3 h-4 rounded-md" />
              <Skeleton className="w-1/2 h-4 rounded-md" />
            </div>
            <div className="space-y-2">
              <Skeleton className="w-3/4 h-4 rounded-md" />
              <Skeleton className="w-2/3 h-4 rounded-md" />
              <Skeleton className="w-4/5 h-4 rounded-md" />
              <Skeleton className="w-1/2 h-4 rounded-md" />
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-card p-4 shadow-md space-y-4">
          <div className="aspect-video w-[50%] overflow-hidden rounded-xl">
            <img
              src={course.thumbnail}
              alt="Course Thumbnail"
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold">{course.title}</h2>
            <p className="text-muted-foreground mt-1 line-clamp-3">
              {course.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p>
                <strong>Category:</strong> {course.category}
              </p>
              <p>
                <strong>Duration:</strong> {course.durationWeeks} weeks
              </p>
              <p>
                <strong>Total Duration:</strong>{" "}
                {formatDuration(course.totalHours)}
              </p>
            </div>
            <div>
              <p>
                <strong>Sections:</strong> {course.totalSections}
              </p>
              <p>
                <strong>Lectures:</strong> {course.totalLectures}
              </p>

              {/* Online Price */}
              <p className="text-sm md:text-base">
                <strong>Online Price:</strong>{" "}
                {course.purchaseOptions?.online?.discountPercentage > 0 ? (
                  <>
                    <span className="font-bold text-black dark:text-white mr-2">
                      ₹{course.purchaseOptions.online.finalPrice}
                    </span>
                    <span className="line-through text-gray-500 mr-2">
                      ₹{course.purchaseOptions.online.original}
                    </span>
                    <span className="text-green-600 font-semibold">
                      ({course.purchaseOptions.online.discountPercentage}% off)
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-black dark:text-white ml-1">
                    ₹{course.purchaseOptions?.online?.original}
                  </span>
                )}
                {course.purchaseOptions?.online?.validUntil && (
                  <span className="block text-xs text-gray-500 mb-2">
                    Offer valid until:{" "}
                    {new Date(
                      course.purchaseOptions.online.validUntil
                    ).toLocaleDateString()}
                  </span>
                )}
              </p>

              {/* Hybrid Price */}
              <p className="text-sm md:text-base">
                <strong>Online Price:</strong>{" "}
                {course.purchaseOptions?.hybrid?.discountPercentage > 0 ? (
                  <>
                    <span className="font-bold text-black dark:text-white mr-2">
                      ₹{course.purchaseOptions.hybrid.finalPrice}
                    </span>
                    <span className="line-through text-gray-500 mr-2">
                      ₹{course.purchaseOptions.hybrid.original}
                    </span>
                    <span className="text-green-600 font-semibold">
                      ({course.purchaseOptions.hybrid.discountPercentage}% off)
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-black dark:text-white ml-1">
                    ₹{course.purchaseOptions?.hybrid?.original}
                  </span>
                )}
                {course.purchaseOptions?.hybrid?.validUntil && (
                  <span className="block text-xs text-gray-500 mb-2">
                    Offer valid until:{" "}
                    {new Date(
                      course.purchaseOptions.hybrid.validUntil
                    ).toLocaleDateString()}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      <Switch
        isSelected={status}
        onValueChange={setStatus}
        color="success"
        classNames={{
          base: cn(
            "inline-flex flex-row-reverse w-full max-w-3xl bg-content1 hover:bg-content2 items-center",
            "justify-between cursor-pointer rounded-xl gap-2 p-4 border-2 border-transparent",
            "data-[selected=true]:border-success"
          ),
          wrapper: "p-0 h-4 overflow-visible",
          thumb: cn(
            "w-6 h-6 border-2 shadow-lg ",
            "group-data-[hover=true]:border-success",
            //selected
            "group-data-[selected=true]:ms-6",
            // pressed
            "group-data-[pressed=true]:w-7",
            "group-data-pressed:group-data-selected:ms-4 border-gray-200"
          ),
        }}
      >
        <div className="flex flex-col gap-1">
          <p className="text-medium">Publish Status</p>
          <p className="text-tiny text-default-400">
            Toggle to make course live or save as draft
          </p>
        </div>
      </Switch>

      <div className="text-center pt-6">
        <Button
          variant="solid"
          color={
            status === originalStatus
              ? "default"
              : status
              ? "success"
              : "warning"
          }
          className="text-lg px-8 py-3"
          onPress={() => onOpenChange(true)}
          isDisabled={loading || status === originalStatus}
        >
          {status ? <RocketIcon size={20} /> : <FilePenIcon size={20} />}
          {status ? "Publish Now" : "Save as Draft"}
        </Button>
        <p className="text-muted-foreground text-sm mt-2">
          This will make your course {status ? "visible" : "hidden"} on the
          platform.
        </p>
      </div>

      {/* Modal for Confirmation */}
      <ConfirmStatusModal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        status={status}
        setStatus={setStatus}
        setOriginalStatus={setOriginalStatus}
        courseId={courseId}
      />
    </div>
  );
}

export default PublishCourse;
