"use client";

import { useState } from "react";
import { Input, Button, Spinner, addToast } from "@heroui/react";
import { EyeIcon, EyeOffIcon, UserIcon } from "lucide-react";
import api from "@/utils/axiosInstance";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [adminId, setAdminId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { adminLogin } = useAdminAuth();

  const router = useRouter();

  const handleLogin = async () => {
    if (!adminId.trim() || !password.trim()) {
      addToast({
        title: "Error",
        description: "Admin ID and password are required.",
        color: "danger",
      });
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/admin/login", { adminId, password });

      addToast({
        title: "Success",
        description: "Admin login successful.",
        color: "success",
      });
      adminLogin(data.token);
      router.push("/admin");
    } catch (error) {
      addToast({
        title: "Login Failed",
        description:
          error.response?.data?.message || "Invalid admin credentials.",
        color: "danger",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-6 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center">Admin Login</h2>
        <div className="mt-6 flex flex-col space-y-4">
          <Input
            label="Admin ID"
            placeholder="Enter admin ID"
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            variant="bordered"
            endContent={<UserIcon />}
            classNames={{ input: "outline-none", label: "mb-4" }}
          />
          <Input
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="bordered"
            endContent={
              <button onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            }
            classNames={{ input: "outline-none", label: "mb-4" }}
          />
          <Button
            className="bg-primary mt-4"
            onPress={handleLogin}
            disabled={loading}
            isLoading={loading}
          >
            Login
          </Button>
        </div>
      </div>
    </div>
  );
}
