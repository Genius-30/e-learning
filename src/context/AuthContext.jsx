"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "@/utils/axiosInstance";
import { useRouter } from "next/navigation";
import useSWR from "swr";

// Create Auth Context
const AuthContext = createContext();

// Function to refresh the access token
const refreshAccessToken = async () => {
  try {
    const { data } = await api.get("/auth/refresh-token");
    return data.accessToken; // Return new token
  } catch (error) {
    console.error("Refresh token expired or invalid");
    return null;
  }
};

// Fetch user data with token refresh handling
const fetchUser = async (accessToken) => {
  try {
    const { data } = await api.get("/user/me", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return data.user;
  } catch (error) {
    if (error.response?.status === 401) {
      console.warn("Access token expired, trying refresh...");

      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        try {
          const { data } = await api.get("/user/me", {
            headers: { Authorization: `Bearer ${newAccessToken}` },
          });
          return data.user;
        } catch (err) {
          console.error("Failed to refetch user after refreshing token");
          return null;
        }
      }
    }
    console.error("Error fetching user:", error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const router = useRouter();

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return JSON.parse(localStorage.getItem("isLoggedIn") || "false");
  });

  const [name, setName] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("name")) || "";
    } catch {
      return "";
    }
  });

  // Fetch new access token on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token = await refreshAccessToken();
      if (token) {
        setAccessToken(token);
      } else {
        setAccessToken("");
        setIsLoggedIn(false);
        setName("");
        localStorage.setItem("isLoggedIn", "false");
        localStorage.setItem("name", "");
      }
    };
    initializeAuth();
  }, []);

  // Use SWR to fetch user data with dynamic token
  const {
    data: user,
    mutate,
    isValidating,
  } = useSWR(
    accessToken ? ["/user/me", accessToken] : null,
    ([_, token]) => fetchUser(token),
    {
      revalidateOnFocus: true,
      onSuccess: (user) => {
        if (user) {
          setIsLoggedIn(true);
          setName(user.name);
          localStorage.setItem("isLoggedIn", "true");
          localStorage.setItem("name", JSON.stringify(user.name));
        } else {
          setIsLoggedIn(false);
          setName("");
          localStorage.setItem("isLoggedIn", "false");
          localStorage.setItem("name", "");
        }
      },
    }
  );

  // Login function (stores user data)
  const login = (userData, token) => {
    setAccessToken(token);
    setIsLoggedIn(true);
    setName(userData.name);
    mutate(userData, false); // optimistically update user data
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("name", JSON.stringify(userData.name));
  };

  // Logout function
  const logout = () => {
    setAccessToken("");
    setIsLoggedIn(false);
    setName("");
    mutate(null, false); // optimistically update user data
    localStorage.setItem("isLoggedIn", "false");
    localStorage.setItem("name", "");
  };

  // Store email for password reset
  const setResetPasswordEmail = (email) => {
    setResetEmail(email);
  };

  const contextValue = useMemo(
    () => ({
      user,
      isLoggedIn,
      name,
      accessToken,
      login,
      logout,
      isLoading: isValidating,
      resetEmail,
      setResetPasswordEmail,
    }),
    [user, isLoggedIn, resetEmail, isValidating, name, accessToken]
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
