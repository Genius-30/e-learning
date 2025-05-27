"use client";

import { useEffect, useState } from "react";
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
import { MailIcon, UserIcon, EyeIcon, EyeOffIcon } from "lucide-react";
import api from "@/utils/axiosInstance";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SignupModal() {
  const { isOpen, onOpenChange } = useModal();

  const [step, setStep] = useState("signup"); // "signup" or "otp"
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const { login } = useAuth();

  // Store resend cooldown expiration time in state
  const [resendCooldown, setResendCooldown] = useState(() => {
    const savedCooldown = localStorage.getItem("otpResendCooldown");
    return savedCooldown ? parseInt(savedCooldown, 10) : 0;
  });

  const [remainingTime, setRemainingTime] = useState(
    Math.max(0, resendCooldown - Math.floor(Date.now() / 1000))
  );

  // Start OTP cooldown and store in localStorage
  const startResendCooldown = () => {
    const cooldownEnd = Math.floor(Date.now() / 1000) + 30; // 30s cooldown
    setResendCooldown(cooldownEnd);
    localStorage.setItem("otpResendCooldown", cooldownEnd);
    setRemainingTime(30);
  };

  // Effect to update the remaining time every second
  useEffect(() => {
    if (remainingTime > 0) {
      const interval = setInterval(() => {
        setRemainingTime((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            localStorage.removeItem("otpResendCooldown");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [remainingTime]);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error when user types
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Validate email format
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Validate password format
  const validatePassword = (password) => {
    const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/;

    if (!password) return "Please provide a password";
    if (password.length < 8) return "Password must be at least 8 characters";
    if (!regex.test(password))
      return "Password must contain at least one uppercase, one lowercase, one number, and one special character";

    return "";
  };

  // Handle signup
  const handleSignup = async () => {
    let newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(formData.email))
      newErrors.email = "Invalid email format";

    const passwordError = validatePassword(formData.password);
    if (passwordError) newErrors.password = passwordError;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/auth/sign-up", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log("Signup successful:", response.data);
      addToast({
        title: "Signup Successful",
        description: "Check your email for OTP.",
        color: "success",
      });

      setStep("otp");
      startResendCooldown();
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      addToast({
        title: "Signup Failed",
        description: error.response?.data?.message || "Something went wrong.",
        color: "Danger",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async () => {
    if (formData.otp.length !== 6 || isNaN(formData.otp)) {
      setErrors({ otp: "Enter a valid 6-digit OTP" });
      return;
    }
    setLoading(true);
    try {
      const response = await api.post("/auth/verify-otp", {
        email: formData.email,
        otp: formData.otp,
      });
      addToast({
        title: "OTP Verified",
        description: "Signup complete!",
        color: "success",
      });

      // empty the form data
      setFormData({ name: "", email: "", password: "", otp: "" });
      setStep("signup");
      setErrors({});

      // login the user
      login(response.data.user, response.data.accessToken);
      router.push("/dashboard");

      onOpenChange(false);
    } catch (error) {
      setErrors({ otp: "Invalid OTP. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP resend
  const handleResendOTP = async () => {
    if (remainingTime > 0) return;

    setLoading(true);
    try {
      await api.post("/auth/resend-otp", { email: formData.email });
      addToast({
        title: "OTP Resent",
        description: "Check your email for a new OTP.",
        color: "success",
      });

      startResendCooldown();
    } catch (error) {
      addToast({
        title: "Failed to Resend OTP",
        description: error.response?.data?.message || "Try again later.",
        color: "danger",
      });
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
              {step === "signup" ? "Create Account" : "Verify OTP"}
            </ModalHeader>
            <ModalBody>
              {step === "signup" ? (
                <>
                  <Input
                    label="Name"
                    name="name"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={handleChange}
                    variant="bordered"
                    endContent={<UserIcon />}
                    isInvalid={!!errors.name}
                    errorMessage={errors.name}
                  />
                  <Input
                    label="Email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    variant="bordered"
                    endContent={<MailIcon />}
                    isInvalid={!!errors.email}
                    errorMessage={errors.email}
                  />
                  <Input
                    label="Password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
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
                    isInvalid={!!errors.password}
                    errorMessage={errors.password}
                  />
                </>
              ) : (
                <>
                  <p className="text-default-500 text-small mb-2">
                    Enter the 6-digit code sent to your email
                  </p>
                  <InputOtp
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
                  <Button
                    onPress={handleResendOTP}
                    isDisabled={remainingTime > 0}
                  >
                    {remainingTime > 0
                      ? `Resend OTP in ${remainingTime}s`
                      : "Resend OTP"}
                  </Button>
                </>
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
                onPress={step === "signup" ? handleSignup : handleVerifyOTP}
                isDisabled={loading}
                isLoading={loading}
              >
                {step === "signup" ? "Sign Up" : "Verify OTP"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
