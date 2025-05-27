"use client";

import { createContext, useContext } from "react";
import { useDisclosure } from "@heroui/react";

// Create context
const ModalContext = createContext();

// ModalProvider component
export const ModalProvider = ({ children }) => {
  const { isOpen, onOpenChange, onOpen } = useDisclosure();

  return (
    <ModalContext.Provider value={{ isOpen, onOpenChange, onOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

// Custom hook for accessing modal state
export const useModal = () => useContext(ModalContext);
