"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/axiosInstance";
import {
  addToast,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Progress,
  Skeleton,
} from "@heroui/react";
import { useAuth } from "@/context/AuthContext";

export default function LecturePlayer({ lectureId }) {
  const videoRef = useRef(null);
  const [lectureData, setLectureData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [watchedDuration, setWatchedDuration] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const router = useRouter();
  const { courseId } = useParams();
  const { accessToken, user } = useAuth();

  useEffect(() => {
    if (!accessToken || !courseId || !lectureId) return;

    const fetchLecture = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(
          `/user/courses/${courseId}/lectures/${lectureId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        const { lecture, watchedDuration = 0, isCompleted = false } = res.data;

        setLectureData(lecture);
        setWatchedDuration(watchedDuration);
        setIsCompleted(isCompleted);
      } catch (err) {
        console.error("Failed to load lecture", err);
        addToast({
          title: "Error",
          description:
            err?.response?.data?.message ||
            "Something went wrong. Please try again.",
          color: "danger",
        });

        router.replace("/my-learnings");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLecture();
  }, [courseId, lectureId, accessToken]);

  useEffect(() => {
    if (!courseId || !lectureId || !user?._id) return;

    const sendProgress = () => {
      const currentTime = Math.floor(videoRef.current?.currentTime || 0);
      const duration = Math.floor(videoRef.current?.duration || 0);

      if (currentTime > 0 && !isNaN(duration)) {
        const isLectureCompleted = duration > 0 && currentTime >= duration - 1;

        navigator.sendBeacon(
          `/api/user/courses/${courseId}/lectures/${lectureId}/progress`,
          new Blob(
            [
              JSON.stringify({
                watchedDuration: currentTime,
                userId: user._id,
                isLectureCompleted,
              }),
            ],
            { type: "application/json" }
          )
        );
      }
    };

    const interval = setInterval(sendProgress, 30000); // Every 30 seconds
    window.addEventListener("beforeunload", sendProgress);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", sendProgress);
    };
  }, [courseId, lectureId, user]);

  const progressPercentage = Math.min(
    (watchedDuration / lectureData?.duration) * 100,
    100
  );

  return (
    <Card shadow="sm" className="w-full bg-background duration-0">
      <CardBody className="overflow-visible">
        {isLoading ? (
          <Skeleton className="w-full aspect-video rounded-lg shadow-sm shadow-background/10"></Skeleton>
        ) : (
          <video
            ref={videoRef}
            src={lectureData?.videoUrl}
            controls
            autoPlay={true}
            onLoadedMetadata={() => {
              if (videoRef.current && watchedDuration > 0) {
                videoRef.current.currentTime = watchedDuration;
              }
            }}
            className="w-full aspect-video rounded-lg shadow-sm shadow-background/10"
            onContextMenu={(e) => e.preventDefault()}
            onEnded={() => {
              if (courseId && lectureId && user._id) {
                navigator.sendBeacon(
                  `/api/user/courses/${courseId}/lectures/${lectureId}/progress`,
                  new Blob(
                    [
                      JSON.stringify({
                        watchedDuration: Math.floor(
                          videoRef.current?.duration || 0
                        ),
                        isLectureCompleted: true,
                        userId: user._id,
                      }),
                    ],
                    { type: "application/json" }
                  )
                );
              }
            }}
          />
        )}
      </CardBody>
      <CardFooter className="text-small justify-between">
        {isLoading ? (
          <div className="w-full flex flex-col justify-between items-center gap-4">
            <div className="w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <Skeleton className="h-6 w-full sm:basis-3/5 rounded-md" />
              <Skeleton className="h-6 w-[40%] sm:basis-2/5 rounded-md" />
            </div>
            <div className="w-full flex flex-col gap-2 mt-1">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-[80%] rounded-md" />
              <Skeleton className="h-4 w-[70%] rounded-md" />
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col justify-between items-start gap-4 px-2">
            <div className="w-full flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
              <h3 className="sm:basis-2/3 text-lg sm:text-xl font-bold">
                {lectureData?.title}
              </h3>
              <div className="sm:basis-1/3 w-full sm:w-auto flex items-center justify-start sm:justify-end gap-2">
                {isCompleted ? (
                  <Chip
                    variant="shadow"
                    color="success"
                    className="self-start sm:self-end"
                  >
                    Completed
                  </Chip>
                ) : (
                  <Progress
                    className="max-w-full sm:max-w-xs"
                    color="success"
                    label="Progress"
                    maxValue={100}
                    value={progressPercentage}
                    showValueLabel={true}
                    size="sm"
                  />
                )}
              </div>
            </div>
            <p className="text-default-500">{lectureData?.description}</p>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
