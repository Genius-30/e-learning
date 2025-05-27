import api from "@/utils/axiosInstance";
import { addToast, Skeleton } from "@heroui/react";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

export default function CourseOverview({ courseId, accessToken }) {
  const [data, setData] = useState({
    title: "",
    description: "",
    category: "",
    createdAt: "",
    updatedAt: "",
    totalWeeks: 0,
    totalHours: 0,
    purchases: {
      online: 0,
      hybrid: 0,
    },
  });
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setData(res.data);
      } catch (err) {
        console.error("Failed to fetch course data", err);
        addToast({
          title: "Failed to load course data",
          description: "Please try again later.",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId && accessToken) {
      fetchData();
    }
  }, [courseId, accessToken]);

  if (loading) {
    return (
      <div className="space-y-4 px-2">
        <Skeleton className="h-8 w-[50%] rounded-md" />
        <div className="w-full mt-10 space-y-2">
          <Skeleton className="h-6 w-full rounded-md" />
          <Skeleton className="h-6 w-[90%] rounded-md" />
          <Skeleton className="h-6 w-[80%] rounded-md" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 rounded-md" />
          <Skeleton className="h-4 rounded-md" />
          <Skeleton className="h-4 rounded-md" />
          <Skeleton className="h-4 rounded-md" />
          <Skeleton className="h-4 rounded-md" />
        </div>
      </div>
    );
  }

  const {
    title,
    description,
    category,
    createdAt,
    updatedAt,
    totalWeeks,
    totalHours,
    purchases,
  } = data;

  const totalEnrolled = (purchases?.online || 0) + (purchases?.hybrid || 0);

  return (
    <div className="space-y-4 px-2">
      <h2 className="text-2xl font-bold">{title}</h2>

      {/* Course Description */}
      <div className="w-full self-start">
        <p className="text-md">
          {(() => {
            if (isExpanded) {
              return description;
            }
            if (description.length > 300) {
              return `${description.slice(0, 300)}...`;
            }
            return description;
          })()}
        </p>

        {/* Button to toggle the full description */}
        {!isExpanded && description.length > 100 && (
          <button
            className="text-blue-500 text-sm cursor-pointer"
            onClick={() => setIsExpanded(true)}
          >
            Show More
          </button>
        )}

        {isExpanded && (
          <button
            className="text-blue-500 text-sm cursor-pointer"
            onClick={() => setIsExpanded(false)}
          >
            Show Less
          </button>
        )}
      </div>

      <div className="text-sm text-text space-y-1">
        <p>
          <strong>Total Enrolled:</strong> {totalEnrolled}
        </p>
        <p>
          <strong>Total Duration:</strong> {totalWeeks} week(s), {totalHours}{" "}
          hour(s)
        </p>
        <p>
          <strong>Category:</strong> {category}
        </p>
        <p>
          <strong>Created At:</strong> {dayjs(createdAt).format("MMMM YYYY")}
        </p>
        <p>
          <strong>Last Updated:</strong> {dayjs(updatedAt).format("MMMM YYYY")}
        </p>
      </div>
    </div>
  );
}
