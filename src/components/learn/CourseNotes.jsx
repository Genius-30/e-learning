import api from "@/utils/axiosInstance";
import { addToast, Skeleton } from "@heroui/react";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";

export default function CourseNotes({ courseId, accessToken }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchSections = async () => {
      try {
        const res = await api.get(`/user/enrollments/${courseId}/notes`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        setSections(res.data.sections);
      } catch (err) {
        console.error("Failed to fetch course notes", err);
        addToast({
          title: "Failed to load course notes",
          description: "Please try again later.",
          color: "danger",
        });
      } finally {
        setLoading(false);
      }
    };

    if (courseId && accessToken) {
      fetchSections();
    }
  }, [courseId, accessToken]);

  const capitalizeWords = (str) =>
    str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-6 px-2">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-5 w-2/5 rounded" />
            {Array.from({ length: 2 }).map((_, j) => (
              <div
                key={j}
                className="flex justify-between items-center p-3 border border-card rounded-lg bg-muted"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-12 rounded-full" />
                  <Skeleton className="h-4 w-40 rounded" />
                </div>
                <Skeleton className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col gap-4 px-2">
      {sections.length > 0 ? (
        sections.map((section) => (
          <div key={section._id} className="mb-3">
            {/* Section Title */}
            <h2 className="text-md sm:text-lg font-semibold mb-2">
              {section.title}
            </h2>

            {/* Notes */}
            {section.notesUrls?.length > 0 ? (
              section.notesUrls.map((note, index) => (
                <a
                  key={index}
                  href={note.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-background hover:bg-hover border border-card rounded-lg transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium bg-blue-100 text-blue-800 rounded-full px-3 py-0.5">
                      {note.fileType?.toUpperCase() || "FILE"}
                    </span>

                    {/* Note title */}
                    <span className="text-sm font-semibold text-text/80 truncate max-w-[200px]">
                      {capitalizeWords(note.title.split(".")[0])}
                    </span>
                  </div>

                  {/* Right side: Upload date */}
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {dayjs(note.uploadDate).format("MMM YYYY")}
                  </span>
                </a>
              ))
            ) : (
              <p className="text-gray-500">No notes available for this section.</p>
            )}
          </div>
        ))
      ) : (
        <p>No notes available for this course.</p>
      )}
    </div>
  );
}
