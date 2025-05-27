"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Spinner,
  addToast,
  InputOtp,
} from "@heroui/react";
import { EyeIcon, EyeOffIcon, CircleAlertIcon } from "lucide-react";
import api from "@/utils/axiosInstance";
import { useAuth } from "@/context/AuthContext";

export default function ResetPasswordModal({ isOpen, onOpenChange }) {
  const [formData, setFormData] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);

  const { resetEmail } = useAuth(); // Custom hook to get user email

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear errors on input change
  };

  const togglePasswordVisibility = () => setShowPassword((prev) => !prev);

  const handleResetPassword = async () => {
    const { otp, newPassword, confirmPassword } = formData;

    if (!otp || !newPassword || !confirmPassword) {
      setErrors({
        otp: !otp ? "Enter the OTP" : "",
        newPassword: !newPassword ? "Enter a new password" : "",
        confirmPassword: !confirmPassword ? "Confirm your password" : "",
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" });
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/reset-password", {
        email: resetEmail,
        otp,
        newPassword,
      });
      addToast({
        title: "Success",
        description: "Password reset successful!",
        color: "success",
      });
      setFormData({ otp: "", newPassword: "", confirmPassword: "" });
      setErrors({});
      onOpenChange(false);
    } catch (error) {
      const status = error.response?.status;
      const errorMessage =
        error.response?.data?.message || "Something went wrong.";

      if (status === 403) {
        setIsBlocked(true);
        addToast({
          title: "Account Deactivated",
          description: "Your account is deactivated. Contact support.",
          color: "warning",
        });
      } else {
        addToast({
          title: "Error",
          description: errorMessage,
          color: "danger",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      onOpenChange={onOpenChange}
      className="w-[90%] sm:w-[30rem]"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader>
              <h2 className="text-xl font-semibold">Reset Password</h2>
            </ModalHeader>
            <ModalBody>
              <div>
                <p className="text-default-500 text-small">
                  Enter the 6-digit code sent to your email
                </p>
                <InputOtp
                  label="Enter OTP"
                  name="otp"
                  length={6}
                  value={formData.otp}
                  onValueChange={(otp) => setFormData({ ...formData, otp })}
                  isInvalid={!!errors.otp}
                  errorMessage={errors.otp}
                  autoFocus
                  textAlign="center"
                  variant="bordered"
                  color="default"
                />
              </div>
              <Input
                label="New Password"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your new password"
                value={formData.newPassword}
                onChange={handleChange}
                variant="bordered"
                autoComplete="off"
                endContent={
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="focus:outline-none"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
                isInvalid={!!errors.newPassword}
                errorMessage={errors.newPassword}
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                variant="bordered"
                autoComplete="off"
                endContent={
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="focus:outline-none"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
                isInvalid={!!errors.confirmPassword}
                errorMessage={errors.confirmPassword}
              />
              {isBlocked && (
                <p className="text-red-500 text-sm mb-2 flex items-center gap-x-2 leading-4">
                  <CircleAlertIcon /> Your account is deactivated. Contact
                  admin.
                </p>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="flat"
                onPress={onClose}
                disabled={loading}
              >
                Close
              </Button>
              <Button
                color="primary"
                onPress={handleResetPassword}
                disabled={loading}
              >
                {loading ? (
                  <Spinner variant="default" color="white" size="sm" />
                ) : (
                  "Reset Password"
                )}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
