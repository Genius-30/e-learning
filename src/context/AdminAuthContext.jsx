"use client";

import { createContext, useContext, useMemo } from "react";
import useSWR from "swr";
import api from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";

const AdminAuthContext = createContext();

const fetchAdmin = async () => {
  try {
    const res = await api.get("/admin/me");

    return res.data.admin;
  } catch (error) {
    console.error("Error fetching admin:", error);
    return null;
  }
};

export function AdminAuthProvider({ children }) {
  const router = useRouter();

  // Use SWR to fetch user data with dynamic token
  const {
    data: admin,
    mutate,
    isValidating,
  } = useSWR("/admin/me", fetchAdmin, {
    revalidateOnFocus: false,
  });

  // Check if user is admin based on role
  const isAdmin = useMemo(() => admin?.role === "admin", [admin]);

  const adminLogin = () => {
    mutate();
  };

  const adminLogout = async () => {
    try {
      await api.post("/admin/logout");

      router.push("/admin/login");
    } catch (error) {
      console.log(error);
    }
    mutate(null, false);
  };

  const contextValue = useMemo(
    () => ({
      admin,
      isAdmin,
      adminLogin,
      adminLogout,
      isLoading: isValidating,
    }),
    [admin, isAdmin, isValidating]
  );

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
