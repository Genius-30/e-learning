"use client";

import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ModalProvider } from "./ModalContext";
import { AuthProvider } from "./AuthContext";
import { AdminAuthProvider } from "./AdminAuthContext";

export function Providers({ children }) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const isAdminRoute = pathname.startsWith("/admin");

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider attribute="class" defaultTheme="system">
        <ToastProvider />
        <ModalProvider>
          {isAdminRoute ? (
            <AdminAuthProvider>{children}</AdminAuthProvider>
          ) : (
            <AuthProvider>{children}</AuthProvider>
          )}
        </ModalProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
