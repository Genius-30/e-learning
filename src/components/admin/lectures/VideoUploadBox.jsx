import api from "@/utils/axiosInstance";
import { Progress, addToast, Button, Skeleton } from "@heroui/react";
import axios from "axios";
import { CircleAlert, CircleX } from "lucide-react";
import React, { useRef, useState } from "react";

function VideoUploadBox({
  editLecture,
  videoUrl,
  setVideoUrl,
  setVideoMetaData,
  abortController,
  setAbortController,
}) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoError, setVideoError] = useState(null);

  const fileInputRef = useRef(null);

  const handleVideoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      setVideoError("Only video files are allowed.");
      return;
    }

    // Validate aspect ratio (landscape only)
    const isLandscape = await new Promise((resolve) => {
      const videoElement = document.createElement("video");
      videoElement.preload = "metadata";
      videoElement.onloadedmetadata = function () {
        URL.revokeObjectURL(videoElement.src);
        const width = videoElement.videoWidth;
        const height = videoElement.videoHeight;
        resolve(width > height); // true if landscape
      };
      videoElement.src = URL.createObjectURL(file);
    });

    if (!isLandscape) {
      e.target.value = null; // Clear the input
      setVideoError("Please upload a landscape (horizontal) video.");
      setVideoUrl(null);
      setVideoMetaData({ duration: null, public_id: null });
      setUploadProgress(0);
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);

    // Get a signed URL from your API for Cloudinary upload
    try {
      setVideoError(null);
      setUploadProgress(2);

      const res = await api.get("/admin/get-signature", {
        params: {
          folder: "lectures",
        },
      });

      setUploadProgress(5);

      // Upload video to Cloudinary via signed URL
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", res.data.apiKey);
      formData.append("timestamp", res.data.timestamp);
      formData.append("signature", res.data.signature);
      formData.append("folder", "CyberGrow Storage/lectures");
      formData.append("type", "authenticated");

      let cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      let resourceType = "video";
      let cloudinaryEndpoint = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const uploadResult = await axios.post(cloudinaryEndpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        signal: controller.signal,
        onUploadProgress: (progressEvent) => {
          const percentUploaded = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );

          // Calculate total progress out of 100
          const totalProgress = 5 + percentUploaded * 0.95; // 5% for signature, 95% for upload
          setUploadProgress(Math.min(Math.round(totalProgress), 100));
        },
      });

      // Save video URL, duration, and public ID
      const { secure_url, duration, public_id } = uploadResult.data;

      setVideoUrl(secure_url);
      setVideoMetaData({ duration, public_id });
      setVideoError(null);
      setUploadProgress(100);

      addToast({
        title: "Video Uploaded Successfully!",
        description: "Your video is ready to go.",
        color: "success",
      });
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log("Upload cancelled by user.");
      } else if (error.name === "CanceledError") {
        addToast({
          color: "warning",
          title: "Upload Cancelled",
          description: "You cancelled the upload.",
        });
      } else {
        console.error("Error uploading video:", error);
        addToast({
          color: "danger",
          title: "Error",
          description: "Failed to upload video.",
        });
      }
    } finally {
      setAbortController(null);
      setUploadProgress(0);
    }
  };

  const handleCancelUpload = () => {
    if (abortController) {
      abortController.abort();
      setUploadProgress(0);
      setVideoUrl(null);
      setVideoMetaData({ duration: null, public_id: null });
      setVideoError(null);
      fileInputRef.current.value = null;
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        {/* Drop Box UI for Video Upload */}
        <input
          ref={fileInputRef}
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          className="hidden"
        />
        {/* Always show upload progress if uploading */}
        {uploadProgress > 0 ? (
          <div className="w-full h-48 border-2 border-dashed border-card rounded-xl flex justify-center items-center">
            <div className="relative h-full w-full flex items-center justify-end px-5">
              <Skeleton className="absolute left-0 h-full w-full rounded-xl" />
              <div className="absolute left-0 w-full flex items-center justify-center">
                <Button
                  isIconOnly
                  onPress={handleCancelUpload}
                  className="rounded-full p-1 my-auto"
                  variant="light"
                >
                  <CircleX size={100} />
                </Button>
              </div>
              <Progress
                label="Uploading..."
                className="max-w-md self-end"
                color="success"
                showValueLabel={true}
                size="sm"
                value={uploadProgress}
                classNames={{
                  base: "absolute self-end mb-5 left-0 w-full px-5",
                }}
              />
            </div>
          </div>
        ) : (
          // If no upload in progress, show dropbox only when no video exists
          !videoUrl &&
          !editLecture?.videoUrl && (
            <label
              htmlFor="video-upload"
              className="w-full h-48 border-2 border-dashed border-card rounded-xl flex flex-col justify-center items-center cursor-pointer px-2"
            >
              <span className="text-justify">
                Drag and drop your video here or click to select
              </span>
            </label>
          )
        )}

        {videoError && (
          <p className="text-red-500 text-sm mt-2">
            <CircleAlert size={20} /> {videoError}
          </p>
        )}
      </div>

      {/* Video Preview */}
      {(videoUrl || editLecture?.videoUrl) && uploadProgress === 0 && (
        <div className="flex flex-col items-center">
          <video
            src={videoUrl || editLecture.videoUrl}
            controls
            className="w-full max-h-64 rounded-lg border border-muted"
          />
          <Button
            variant="flat"
            onPress={() => {
              setVideoUrl(null);
              setVideoMetaData({ duration: null, public_id: null });
              setVideoError(null);
              fileInputRef.current.value = null;
              fileInputRef.current?.click();
            }}
            className="mt-2 w-full"
          >
            Change Video
          </Button>
        </div>
      )}
    </div>
  );
}

export default VideoUploadBox;
