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

export default function AddSectionModal({
  isOpen,
  onOpenChange,
  onSectionAdded,
  editSection = null,
  onSectionUpdated,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const { courseId } = useParams();

  // Pre-fill data when editing
  useEffect(() => {
    if (editSection) {
      setTitle(editSection.title || "");
      setDescription(editSection.description || "");
    } else {
      setTitle("");
      setDescription("");
    }
  }, [editSection, isOpen]);

  const handleAddSection = async () => {
    if (!title.trim()) {
      addToast({
        title: "Validation Error",
        description: "Section title is required",
        color: "warning",
      });
      return;
    }

    setLoading(true);

    try {
      if (editSection) {
        // EDIT MODE
        await api.patch(
          `/admin/courses/${courseId}/sections/${editSection._id}/update`,
          { title, description }
        );

        addToast({
          title: "Updated",
          description: "Section updated successfully!",
          color: "success",
        });

        onSectionUpdated?.({
          _id: editSection._id,
          title,
          description,
        });
      } else {
        // ADD MODE
        const res = await api.post(`/admin/courses/${courseId}/sections/add`, {
          title,
          description,
        });

        addToast({
          title: "Success",
          description: "Section added successfully!",
          color: "success",
        });

        onSectionAdded({
          _id: res.data._id,
          title: res.data.title,
          description: res.data.description,
        });
      }

      onOpenChange(false);
    } catch (error) {
      addToast({
        color: "danger",
        title: "Error",
        description:
          error?.response?.data?.message ||
          `Failed to ${editSection ? "update" : "add"} section. Try again!`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      backdrop="opaque"
      placement="center"
    >
      <ModalContent className="space-y-4">
        {(onClose) => (
          <>
            <ModalHeader>
              {editSection ? "Edit Section" : "Add New Section"}
            </ModalHeader>
            <ModalBody>
              <Input
                isRequired
                label="Section Title"
                placeholder="e.g., Introduction to HTML"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <Textarea
                label="Description"
                placeholder="Optional short description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                color="primary"
                isLoading={loading}
                onPress={handleAddSection}
              >
                {editSection ? "Save Changes" : "Add Section"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
