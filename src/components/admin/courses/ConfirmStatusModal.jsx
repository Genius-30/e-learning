import api from "@/utils/axiosInstance";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  addToast,
} from "@heroui/react";
import { useState } from "react";

export default function ConfirmStatusModal({
  isOpen,
  onOpenChange,
  status, // Boolean — true = publish, false = draft
  setStatus,
  setOriginalStatus,
  courseId,
}) {
  const [updating, setUpdating] = useState(false);

  const handleSaveStatus = async () => {
    try {
      setUpdating(true);
      const res = await api.patch(`/admin/courses/${courseId}/status`, {
        status: status ? "published" : "draft",
      });

      addToast({
        title: "Success",
        description: res.data.message,
        color: "success",
      });
      setStatus(res.data.status === "published"); // Toggle status
      setOriginalStatus(res.data.status === "published"); // Update original status
    } catch (err) {
      console.error("Status update failed:", err);
      addToast({
        title: "Update Failed",
        description:
          err?.response?.data?.message || "Could not update course status.",
        color: "danger",
      });
    } finally {
      onOpenChange(false); // Close the modal
      setUpdating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} hideCloseButton>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-lg font-bold">
              {status ? "Publish Course" : "Save as Draft"}
            </ModalHeader>

            <ModalBody>
              <p className="text-muted-foreground">
                Are you sure you want to{" "}
                <strong>{status ? "publish" : "save as draft"}</strong> this
                course?
              </p>
            </ModalBody>

            <ModalFooter>
              <Button variant="light" onPress={onClose}>
                Cancel
              </Button>
              <Button
                color={status ? "success" : "warning"}
                onPress={handleSaveStatus}
                isDisabled={updating}
                isLoading={updating}
              >
                Confirm
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
