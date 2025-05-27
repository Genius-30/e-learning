"use client";

import {
  Card,
  CardFooter,
  Image,
  CardBody,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Skeleton,
} from "@heroui/react";
import { CirclePlayIcon } from "lucide-react";
import { useEffect, useState } from "react";

export default function CoursePreview({
  loading,
  thumbnail,
  previewLectures = [],
  isOpen,
  onOpenChange,
  selectedPreview,
}) {
  const [selectedLecture, setSelectedLecture] = useState(
    selectedPreview || previewLectures[0] || null
  );
  const [isTabInactive, setIsTabInactive] = useState(false);

  useEffect(() => {
    setSelectedLecture(selectedPreview || previewLectures[0] || null);
  }, [previewLectures, selectedPreview]);

  // useEffect(() => {
  //   if (!isOpen) return;
  //   const handleKeyDown = (e) => {
  //     if (
  //       (e.ctrlKey && e.key === "s") || // Block Ctrl+S
  //       (e.ctrlKey && e.shiftKey && e.key === "I") || // Block Ctrl+Shift+I
  //       (e.ctrlKey && e.shiftKey && e.key === "J") || // Block Ctrl+Shift+J
  //       (e.ctrlKey && e.key === "u") // Block Ctrl+U (view source)
  //     ) {
  //       e.preventDefault();
  //       alert("Not allowed 🚫");
  //     }
  //   };

  //   const handleContextMenu = (e) => {
  //     e.preventDefault(); // Disable right-click menu
  //   };

  //   document.addEventListener("keydown", handleKeyDown);
  //   document.addEventListener("contextmenu", handleContextMenu);

  //   return () => {
  //     document.removeEventListener("keydown", handleKeyDown);
  //     document.removeEventListener("contextmenu", handleContextMenu);
  //   };
  // }, [isOpen]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setIsTabInactive(true);
      } else {
        setIsTabInactive(false);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

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

  if (loading || !thumbnail) {
    return (
      <Card className="relative shrink-0 w-full bg-zinc-100 dark:bg-zinc-800 max-w-[500px] mx-auto border-none">
        <CardBody className="overflow-visible p-0">
          <Skeleton className="aspect-video rounded-lg" />
        </CardBody>
        <CardFooter className="text-md justify-between px-8 py-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <>
      {/* Course Thumbnail Card */}
      <Card
        isPressable
        className="relative shrink-0 w-full bg-zinc-100 dark:bg-zinc-800 max-w-[500px] mx-auto border-none data-[pressed=true]:scale-100"
        radius="lg"
        shadow="sm"
        onPress={() => onOpenChange(true)}
      >
        <CardBody className="overflow-visible p-0">
          <Image
            alt="Course Thumbnail"
            className=" object-cover aspect-video"
            radius="lg"
            shadow="sm"
            src={thumbnail}
            width="100%"
          />
        </CardBody>
        <CardFooter className="text-md justify-between px-8 py-4">
          <b>Preview</b>
          <CirclePlayIcon strokeWidth={1.75} className="w-6 h-6" />
        </CardFooter>
      </Card>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Preview Lectures</ModalHeader>
              <ModalBody className="flex flex-col gap-4">
                {/* Video Player */}
                {selectedLecture ? (
                  <video
                    autoPlay
                    muted
                    key={selectedLecture._id}
                    src={selectedLecture?.videoUrl}
                    controls
                    controlsList="nodownload"
                    className={`w-full aspect-video rounded-lg bg-black ${
                      isTabInactive ? "blur-md" : ""
                    }`}
                    onContextMenu={(e) => e.preventDefault()}
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center text-gray-500">
                    No preview lecture selected 🥲
                  </div>
                )}

                {previewLectures.length === 0 ? (
                  <p>No preview lectures available 🥲</p>
                ) : (
                  <div className="flex flex-col gap-2 max-h-80 overflow-y-auto">
                    {previewLectures.map((lecture) => (
                      <div
                        key={lecture._id}
                        className={`p-4 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                          selectedLecture?._id === lecture._id
                            ? "bg-primary/20 border-primary"
                            : "hover:bg-hover border-card"
                        }`}
                        onClick={() => setSelectedLecture(lecture)}
                      >
                        <div>
                          <p className="font-semibold">{lecture.title}</p>
                          <p className="text-sm text-gray-500">
                            {formatDuration(lecture.duration)}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          color="primary"
                          variant={
                            selectedLecture?._id === lecture._id
                              ? "solid"
                              : "ghost"
                          }
                          onPress={() => setSelectedLecture(lecture)}
                        >
                          {selectedLecture?._id === lecture._id
                            ? "Playing"
                            : "Play"}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
