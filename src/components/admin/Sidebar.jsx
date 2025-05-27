"use client";

import { usePathname } from "next/navigation";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  Tooltip,
  Link,
} from "@heroui/react";
import { LayoutDashboard, Book, Users, Settings, XIcon } from "lucide-react";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const menuItems = [
    {
      name: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    { name: "Courses", href: "/admin/courses", icon: <Book size={20} /> },
    { name: "Users", href: "/admin/users", icon: <Users size={20} /> },
    { name: "Settings", href: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile Sidebar Drawer */}
      <Drawer
        hideCloseButton
        backdrop="blur"
        placement="left"
        isOpen={isOpen}
        onOpenChange={onClose}
        classNames={{
          base: "rounded-medium sm:data-[placement=left]:m-2 shadow-lg pt-[20px]",
        }}
      >
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex justify-between px-4 py-2 border-b border-default-200/50">
                <h2 className="text-lg font-semibold">Admin Panel</h2>
                <Tooltip content="Close">
                  <Button
                    isIconOnly
                    size="sm"
                    variant="light"
                    onPress={onClose}
                  >
                    <XIcon size={20} />
                  </Button>
                </Tooltip>
              </DrawerHeader>

              <DrawerBody className="px-4 py-2">
                <nav className="flex flex-col gap-3">
                  {menuItems.map((item) => (
                    <Button
                      as={Link}
                      variant="solid"
                      className={`flex items-center gap-3 py-2 rounded-lg transition-all w-full text-left justify-start px-4 lg:px-8 ${
                        pathname.includes(item.name.toLowerCase())
                          ? "bg-primary text-white shadow-md"
                          : "hover:bg-hover"
                      }`}
                      key={item.name}
                      href={item.href}
                      onPress={onClose}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Button>
                  ))}
                </nav>
              </DrawerBody>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}
