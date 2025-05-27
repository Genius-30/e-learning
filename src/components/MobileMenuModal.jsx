import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  Link,
} from "@heroui/react";
import ThemeToggleButton from "./other/ThemeToggleButton";
import { usePathname } from "next/navigation";

const MobileMenuModal = ({
  isOpen,
  onOpenChange,
  menuItems,
  theme,
  onThemeToggle,
  isLoggedIn,
  onLogout,
  onLogin,
  onSignup,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="text-center text-lg font-semibold mb-2">
              Menu
            </ModalHeader>
            <ModalBody className="flex flex-col space-y-4">
              {menuItems.map(({ name, href }) => {
                const pathname = usePathname();
                const isActive = pathname === href;
                return (
                  <Link
                    key={name}
                    href={href}
                    className={`text-base text-text ${
                      isActive ? "text-secondary" : ""
                    }`}
                    onPress={onClose}
                  >
                    {name}
                  </Link>
                );
              })}

              <ThemeToggleButton
                isDarkMode={theme === "dark"}
                onToggle={() => {
                  onThemeToggle();
                }}
                showLabel={true}
              />

              <div className="flex flex-col space-y-2">
                {isLoggedIn ? (
                  <Button
                    onPress={() => {
                      onLogout();
                      onClose();
                    }}
                    className="bg-secondary text-white"
                  >
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button
                      variant="bordered"
                      onPress={() => {
                        onLogin();
                        onClose();
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      color="primary"
                      onPress={() => {
                        onSignup();
                        onClose();
                      }}
                    >
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default MobileMenuModal;
