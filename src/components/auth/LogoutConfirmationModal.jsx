"use client";

import { useAuth } from "@/context/AuthContext";
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
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutConfirmationModal({
  isOpen,
  onOpenChange,
  onOpenLogin,
}) {
  const [isLoading, setIsLoading] = useState(false);

  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await api.post("/auth/logout");

      logout();

      addToast({
        title: "Logout Successful",
        description: "You have been logged out successfully.",
        color: "success",
      });

      onOpenChange(false);
      onOpenLogin();

      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
      addToast({
        title: "Logout Failed",
        description: "An error occurred while logging out. Please try again.",
        color: "danger",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      hideCloseButton
      placement="center"
      backdrop="blur"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>Confirm Logout</ModalHeader>
            <ModalBody>
              Are you sure you want to logout? You can login again only with the
              help of Admin.
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="flat"
                isDisabled={isLoading}
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                color="secondary"
                isDisabled={isLoading}
                isLoading={isLoading}
                onPress={handleLogout}
              >
                Logout
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
