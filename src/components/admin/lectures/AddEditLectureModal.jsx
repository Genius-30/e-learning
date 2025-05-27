"use client";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Textarea,
  Button,
  addToast,
} from "@heroui/react";
import { useParams } from "next/navigation";
import api from "@/utils/axiosInstance";
import VideoUploadBox from "./VideoUploadBox";

export default function AddEditLectureModal({
  isOpen,
  onOpenChange,
  sectionId,
  editLecture = null,
  onLectureAdded,
  onLectureUpdated,
}) {
  const { courseId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoMetaData, setVideoMetaData] = useState({
    duration: null,
    public_id: null,
  });
  const [loading, setLoading] = useState(false);
  const [abortController, setAbortController] = useState(null);

  // Reset or pre-fill on open
  useEffect(() => {
    setTitle(editLecture?.title || "");
    setDescription(editLecture?.description || "");
    setVideoUrl(null);
  }, [editLecture, isOpen]);

  const handleLectureSubmit = async () => {
    if (!title.trim()) {
      addToast({
        title: "Validation Error",
        description: "Lecture title is required.",
        color: "warning",
      });
      return;
    }

    if (!editLecture && !videoUrl) {
      addToast({
        title: "Validation Error",
        description: "Lecture video is required.",
        color: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      const isTitleUpdated = title !== editLecture?.title;
      const isDescUpdated = description !== editLecture?.description;
      const isVideoUpdated = videoMetaData.public_id !== editLecture?.publicId;

      // Create payload object to send in the request body
      const payload = {
        title: isTitleUpdated ? title : undefined,
        description: isDescUpdated ? description : undefined,
        videoMetaData: isVideoUpdated ? videoMetaData : undefined,
      };

      // 👇 Strip out any accidental inclusion
      delete payload.videoUrl;

      // Remove undefined properties
      Object.keys(payload).forEach(
        (key) => payload[key] === undefined && delete payload[key]
      );

      if (!editLecture) {
        const res = await api.post(
          `/admin/courses/${courseId}/sections/${sectionId}/lectures/upload`,
          payload
        );

        onLectureAdded?.(res.data.lecture);

        addToast({
          title: "Success",
          description: "Lecture added successfully!",
          color: "success",
        });
      } else {
        // Edit Lecture - Only send updated fields
        if (!isTitleUpdated && !isDescUpdated && !isVideoUpdated) {
          addToast({
            title: "No Changes",
            description: "No changes to update.",
            color: "warning",
          });
          return setLoading(false);
        }

        const res = await api.patch(
          `/admin/courses/${courseId}/sections/${sectionId}/lectures/${editLecture._id}`,
          payload
        );

        const { _id, title, description, videoUrl } = res.data.lecture;

        onLectureUpdated?.({
          _id,
          title,
          description,
          videoUrl,
        });

        addToast({
          title: "Updated",
          description: "Lecture updated successfully!",
          color: "success",
        });
      }

      onOpenChange(false);
    } catch (error) {
      addToast({
        color: "danger",
        title: "Error",
        description:
          error?.response?.data?.message ||
          `Failed to ${editLecture ? "update" : "add"} lecture. Try again!`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => {
        // Prevent closing modal while upload is active
        if (!loading && !abortController) onOpenChange(open);
      }}
      backdrop="opaque"
      placement="center"
      isDismissable={!loading && !abortController}
      isKeyboardDismissDisabled={loading || abortController}
      classNames={{
        modal: "max-w-lg",
      }}
    >
      <ModalContent className="space-y-4">
        {(onClose) => (
          <>
            <ModalHeader>
              {editLecture ? "Edit Lecture" : "Add New Lecture"}
            </ModalHeader>
            <ModalBody>
              <Input
                isRequired
                label="Lecture Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <Textarea
                label="Lecture Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <VideoUploadBox
                editLecture={editLecture}
                videoUrl={videoUrl}
                setVideoUrl={setVideoUrl}
                setVideoMetaData={setVideoMetaData}
                abortController={abortController}
                setAbortController={setAbortController}
              />
            </ModalBody>
            <ModalFooter>
              <Button
                variant="light"
                onPress={() => {
                  if (abortController) {
                    addToast({
                      title: "Upload in Progress",
                      description:
                        "Please cancel the video upload before closing.",
                      color: "warning",
                    });
                    return;
                  }

                  // Only close if no upload is in progress
                  onOpenChange(false);
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={loading}
                onPress={handleLectureSubmit}
                isDisabled={loading || !title.trim() || abortController}
              >
                {editLecture ? "Save Changes" : "Add Lecture"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
