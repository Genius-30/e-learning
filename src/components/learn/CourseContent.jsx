import { cn } from "@/lib/utils";
import api from "@/utils/axiosInstance";
import {
  Accordion,
  AccordionItem,
  Divider,
  Progress,
  Skeleton,
} from "@heroui/react";
import { Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function CourseContent({
  courseId,
  accessToken,
  selectedLectureId,
  setSelectedLectureId,
}) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openSectionId, setOpenSectionId] = useState(null);

  const selectedRef = useRef(null);

  const findMatchedSection = (sections) => {
    return sections.find((section) =>
      section.lectures.some((lecture) => lecture._id === selectedLectureId)
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/user/enrollments/${courseId}/content`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        const fetchedSections = res.data?.sections || [];
        setSections(fetchedSections);

        // Auto-expand the section that contains the selected lecture
        if (selectedLectureId) {
          const matchingSection = findMatchedSection(fetchedSections);
          if (matchingSection) {
            setOpenSectionId(matchingSection._id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch course content", error);
      } finally {
        setLoading(false);
      }
    };

    if (courseId && accessToken && selectedLectureId) {
      fetchData();
    }
  }, [courseId, accessToken, selectedLectureId]);

  // Scroll to the selected lecture
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [sections]);

  function formatDuration(hours) {
    const totalSeconds = Math.floor(hours * 3600);
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;

    const parts = [];
    if (h > 0) parts.push(`${h}h`);
    if (m > 0) parts.push(`${m}m`);
    if (s > 0 && h === 0) parts.push(`${s}s`); // include seconds only if under 1h

    return parts.join("");
  }

  if (loading) {
    return (
      <div className="w-full space-y-2">
        {[...Array(5)].map((_, idx) => (
          <div
            key={idx}
            className="p-4 bg-content1 shadow-medium rounded-medium"
          >
            {/* Section title & meta */}
            <div className="w-full space-y-1">
              {/* Section title */}
              <Skeleton className="h-4 w-4/5 rounded-md" />
              <Skeleton className="h-4 w-3/5 rounded-md" />
              {/* Duration + lectures */}
            </div>
            <Skeleton className="h-3 w-1/3 rounded-md mt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <Accordion
      variant="splitted"
      className="px-0"
      defaultExpandedKeys={[openSectionId || sections[0]?._id]}
    >
      {sections.map((section, sectionIndex) => (
        <AccordionItem
          key={section._id}
          aria-label={section.title}
          title={
            <span className="font-semibold">
              {sectionIndex + 1}. {section.title}
            </span>
          }
          subtitle={
            <span className="text-sm text-muted-foreground">
              {section.totalLectures} Lectures •{" "}
              {formatDuration(section.totalLength)}
            </span>
          }
        >
          <div className="mb-4">
            <Progress
              value={section.progress}
              color="success"
              size="sm"
              showValueLabel
              label="Progress"
              aria-label="Section Progress"
            />
          </div>
          <Divider className="my-4" />
          <ul className="space-y-2 pb-4">
            {section.lectures.map((lecture, lectureIndex) => {
              const isSelected = lecture._id === selectedLectureId;
              return (
                <li
                  key={lecture._id}
                  ref={isSelected ? selectedRef : null}
                  onClick={() => setSelectedLectureId(lecture._id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setSelectedLectureId(lecture._id);
                    }
                  }}
                  tabIndex={0}
                  className={cn(
                    "cursor-pointer px-3 py-2 rounded-md flex justify-between items-center hover:bg-hover transition",
                    isSelected &&
                      "ring-1 ring-blue text-blue dark:hover:text-white"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {sectionIndex + 1}.{lectureIndex + 1} {lecture.title}
                    </span>
                    {lecture.duration && (
                      <span className="text-xs text-gray-500">
                        ({formatDuration(lecture.duration / 3600)})
                      </span>
                    )}
                  </div>
                  {lecture.isCompleted && (
                    <Check className="bg-green-500 text-white shrink-0 p-1 font-bold rounded-sm" />
                  )}
                </li>
              );
            })}
          </ul>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
