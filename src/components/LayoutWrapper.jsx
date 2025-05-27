"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import SignupModal from "@/components/auth/Signup";
import { Footer } from "@/components/other/Footer";
import AdminNavbar from "@/components/admin/Navbar";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Spinner } from "@heroui/react";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();

  const isAdminRoute = pathname.startsWith("/admin");
  const isAdminLogin = pathname === "/admin/login";

  const adminAuth = isAdminRoute ? useAdminAuth() : null;

  const isLoading = adminAuth?.isLoading || false;
  const isAdmin = adminAuth?.isAdmin || false;

  // Handle loading state
  if (isAdminRoute && isLoading) {
    return (
      <div className="min-h-screen w-full flex justify-center items-center">
        <Spinner
          className="w-full"
          variant="default"
          color="var(--color-zinc-900)"
          size="lg"
        />
      </div>
    );
  }

  return (
    <div className={`${isAdminLogin ? "" : "pt-20"}`}>
      {isAdminRoute ? isAdmin && <AdminNavbar /> : <Navbar />}
      {children}
      {!isAdminRoute && <SignupModal />}
      {!isAdminRoute && <Footer />}
    </div>
  );
}
