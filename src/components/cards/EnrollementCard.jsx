import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardBody, CardFooter, Progress } from "@heroui/react";
import { FaPlay } from "react-icons/fa";

const EnrolledCourseCard = ({ enroll }) => {
  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const formatted =
      h > 0
        ? `${h}:${m.toString().padStart(2, "0")}:${s
            .toString()
            .padStart(2, "0")}`
        : `${m}:${s.toString().padStart(2, "0")}`;

    return formatted;
  };

  return (
    <Card
      shadow="sm"
      className="bg-transparent border border-card shadow-none hover:scale-[1.02] hover:shadow-lg transition-transform duration-300 ease-in-out"
    >
      {/* Thumbnail */}
      <CardBody className="p-0 border-b border-card overflow-hidden">
        <div className="relative w-full h-[200px]">
          <Image
            src={enroll.thumbnail}
            alt={enroll.title}
            layout="fill"
            objectFit="cover"
            className="rounded-t-lg"
          />
        </div>
      </CardBody>

      {/* Info */}
      <CardFooter className="flex flex-col items-start text-sm p-4 gap-3">
        <div className="flex justify-between w-full items-start">
          <h3 className="text-lg font-semibold truncate text-wrap text-start">
            {enroll.title}
          </h3>
          {enroll.completed && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium mt-1">
              Completed
            </span>
          )}
        </div>

        {/* Last watched */}
        {enroll.lastLecture && (
          <p className="text-start text-muted-foreground text-sm">
            <strong>Last Watched:</strong> {enroll.lastLecture.title} (
            {formatTime(enroll.lastLecture.watchedDuration)} /{" "}
            {formatTime(enroll.lastLecture.duration)})
          </p>
        )}

        {/* Progress */}
        <Progress
          value={enroll.progress}
          label="Progress"
          showValueLabel
          maxValue={100}
          size="sm"
          className="mt-1 w-full mb-2"
          color="success"
        />

        {/* Action Button */}
        <Link
          href={`courses/${enroll.courseId}/learn`}
          className="w-full h-[40px]"
        >
          <button className="h-full w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-all cursor-pointer">
            <FaPlay size={14} />
            Continue Learning
          </button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default EnrolledCourseCard;
