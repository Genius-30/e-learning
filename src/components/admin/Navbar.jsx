"use client";

import { motion } from "framer-motion";
import { addToast, Button } from "@heroui/react";
import { useEffect, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import Sidebar from "./Sidebar";
import ThemeToggleButton from "../other/ThemeToggleButton";
import { MenuIcon, PlusIcon } from "lucide-react";
import api from "@/utils/axiosInstance";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark");
  const [scrolled, setScrolled] = useState(false);
  const { adminLogout } = useAdminAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState("Dashboard");
  const [loading, setLoading] = useState(false);

  const pathname = usePathname(); // current route
  const router = useRouter(); // router instance

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const pathToTitleMap = {
      "/admin": "Dashboard",
      "/admin/courses": "Courses",
      "/admin/users": "Users",
      "/admin/users/edit": "Edit User",
      "/admin/profile": "Profile",
    };

    const normalizedPath = pathname.toLowerCase();

    let matchedTitle = pathToTitleMap[normalizedPath];

    if (
      !matchedTitle &&
      normalizedPath.includes("/admin/courses/") &&
      normalizedPath.includes("/manage/")
    ) {
      matchedTitle = "Manage Course";
    }

    if (!matchedTitle) {
      // Fallback: Generate from last segment
      const pathSegments = normalizedPath.split("/").filter(Boolean);
      matchedTitle =
        pathSegments.length > 0
          ? decodeURIComponent(pathSegments[pathSegments.length - 1])
              .replace(/-/g, " ")
              .replace(/\b\w/g, (char) => char.toUpperCase())
          : "Dashboard";
    }

    setPageTitle(matchedTitle);
  }, [pathname]);

  const handleCreateCourse = async () => {
    setLoading(true);
    try {
      const res = await api.post("/admin/courses/create");
      const { courseId } = res.data;

      router.push(`/admin/courses/${courseId}/manage/details`);
      addToast({
        title: "Course draft created",
        description: "You can now edit your course.",
        color: "success",
      });
    } catch (error) {
      addToast({
        title: "Error creating course draft",
        description:
          error?.response?.data?.message ||
          error.message ||
          "Something went wrong.",
        color: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleThemeToggle = useCallback(() => {
    setIsDarkMode((prev) => !prev);
    setTheme(isDarkMode ? "light" : "dark");
  }, [isDarkMode, setTheme]);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <motion.nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-4 py-3 rounded-full transition-all duration-300 text-[var(--color-text)] w-[95%] ${
          scrolled
            ? "backdrop-blur-lg bg-[var(--color-background)]/90"
            : "backdrop-blur-xl bg-opacity-80"
        } bg-transparent`}
      >
        <div className="flex items-center gap-4">
          {/* Sidebar Toggle Button */}
          <Button
            variant="light"
            isIconOnly
            className="text-xl"
            onPress={() => setSidebarOpen(true)}
          >
            <MenuIcon />
          </Button>

          {/* Page Title */}
          <h2 className="text-lg font-semibold text-text leading-5">
            {pageTitle}
          </h2>
        </div>

        <div className="flex items-center space-x-5">
          {pathname === "/admin/courses" && (
            <>
              {/* Desktop Button */}
              <Button
                variant="solid"
                className="hidden sm:flex bg-primary text-white px-4 py-2 rounded-full"
                onPress={handleCreateCourse}
                isLoading={loading}
                isDisabled={loading}
              >
                {!loading && <PlusIcon className="h-4 w-4" />}
                <span>Add Course</span>
              </Button>
            </>
          )}

          <ThemeToggleButton
            isDarkMode={isDarkMode}
            onToggle={handleThemeToggle}
          />
          <Button
            variant="destructive"
            className="px-4 py-2 bg-secondary text-white rounded-full"
            onPress={adminLogout}
          >
            Logout
          </Button>
        </div>
      </motion.nav>
    </>
  );
}
