import { Accordion, AccordionItem, Button, Skeleton } from "@heroui/react";
import React from "react";

function CourseCurriculum({ loading, sectionsResponse, onPreviewClick }) {
  const { sections, totalSections, totalLectures } = sectionsResponse || {};

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-4 mt-10">
        <h2 className="text-2xl font-bold">Course Curriculum</h2>
        <Skeleton className="h-6 w-1/3 rounded-md" />
        <Skeleton className="h-14 w-full mt-4 rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-14 w-full rounded-md" />
      </div>
    );
  }

  function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    } else {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
  }

  function formatHours(hours) {
    if (typeof hours !== "number" || isNaN(hours)) {
      return "0m";
    }

    const totalMinutes = Math.round(hours * 60);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;

    if (hrs > 0 && mins > 0) {
      return `${hrs}h ${mins}m`;
    } else if (hrs > 0) {
      return `${hrs}h`;
    } else {
      return `${mins}m`;
    }
  }

  return (
    <div className="w-full self-start mt-10">
      {/* Header showing total sections and lectures */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Course Curriculum</h2>
        <p className="text-gray-500 text-sm mt-1">
          {totalSections} sections • {totalLectures} lectures
        </p>
      </div>

      {/* Accordion for sections */}
      {sections && sections.length > 0 ? (
        <Accordion variant="splitted" className="px-0">
          {sections.map((section) => (
            <AccordionItem
              key={section._id}
              aria-label={section.title}
              title={section.title}
              subtitle={`${section.lectures.length} lectures • ${formatHours(
                section.totalHours
              )}`}
            >
              <div className="flex flex-col gap-4">
                {/* Section Description */}
                {section.description && (
                  <p className="text-sm text-gray-600 mb-4">
                    {section.description}
                  </p>
                )}

                {/* Lectures List */}
                {section.lectures.map((lecture) => (
                  <div
                    key={lecture._id}
                    className="flex flex-col border-b border-card pb-4 gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-md font-medium">{lecture.title}</h3>
                        <p className="text-xs text-gray-500">
                          {formatDuration(lecture.duration)}
                        </p>
                      </div>

                      {/* Preview badge */}
                      {lecture.isFreePreview && (
                        <Button
                          onPress={() => onPreviewClick(lecture)}
                          className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-md"
                        >
                          Preview
                        </Button>
                      )}
                    </div>

                    {/* Lecture Description */}
                    {lecture.description && (
                      <p className="text-xs text-gray-500 ml-1 mt-1">
                        {lecture.description}
                      </p>
                    )}
                  </div>
                ))}

                {/* Section Notes */}
                {section.notesUrls && section.notesUrls.length > 0 && (
                  <div className="mt-6">
                    <h4 className="text-sm font-semibold mb-2">
                      Section Notes:
                    </h4>
                    <div className="flex flex-col gap-2">
                      {section.notesUrls.map((note, index) => (
                        <a
                          key={index}
                          href={note.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-blue-600 hover:underline text-sm"
                        >
                          {/* Icon based on file type (bonus touch) */}
                          <span className="text-xs bg-gray-200 rounded-full px-2 py-0.5">
                            {note.fileType?.toUpperCase() || "FILE"}
                          </span>
                          {note.title}
                          <span className="text-gray-400 text-xs">
                            ({new Date(note.uploadedAt).toLocaleDateString()})
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="text-center text-gray-500 mt-4">
          No sections available for this course.
        </div>
      )}
    </div>
  );
}

export default CourseCurriculum;
