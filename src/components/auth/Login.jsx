import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  addToast,
  InputOtp,
} from "@heroui/react";
import { MailIcon, EyeIcon, EyeOffIcon, CircleAlertIcon } from "lucide-react";
import api from "@/utils/axiosInstance";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function LoginModal({
  isOpen,
  onOpenChange,
  onResetPasswordClick,
}) {
  const [step, setStep] = useState("login"); // "login" or "otp"
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    otp: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const { login } = useAuth();
  const { setResetPasswordEmail } = useAuth(); // Get the setResetPasswordEmail function

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear error when user types
    setErrorMessage("");
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  // Validate email format
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Handle login
  const handleLogin = async () => {
    let newErrors = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(formData.email))
      newErrors.email = "Invalid email format";

    if (!formData.password.trim()) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      await api.post("/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      addToast({
        title: "Login Successful",
        description: "Check your email for Login OTP.",
        color: "success",
      });

      setStep("otp");
    } catch (error) {
      const status = error.response?.status;
      const errorCode = error.response?.data?.errorCode;
      const errorMessage =
        error.response?.data?.message || "Something went wrong.";

      if (status === 403) {
        if (errorCode === "ACCOUNT_DEACTIVATED") {
          addToast({
            title: "Account Deactivated",
            description: "Your account is deactivated. Please contact support.",
            color: "warning",
          });
        } else if (errorCode === "ALREADY_LOGGED_IN") {
          addToast({
            title: "Already Logged In",
            description: "You are already logged in. Please log out first.",
            color: "info",
          });
        } else {
          addToast({
            title: "Login Failed",
            description: errorMessage,
            color: "danger",
          });
        }
        setErrorMessage(errorMessage);
      } else {
        addToast({
          title: "Login Failed",
          description: errorMessage,
          color: "danger",
        });
      }
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
      const response = await api.post("/auth/verify-login-otp", {
        email: formData.email,
        otp: formData.otp,
      });
      addToast({
        title: "OTP Verified",
        description: "Login complete!",
        color: "success",
      });

      // empty the form data
      setFormData({ email: "", password: "", otp: "" });
      setErrors({});
      setStep("login");

      // Call the login function from the context
      login(response.data.user, response.data.accessToken);

      router.push("/dashboard");
      onOpenChange(false);
    } catch (error) {
      console.log(error);
      setErrors({ otp: "Invalid OTP. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email.trim() || !isValidEmail(formData.email)) {
      setErrors({ email: "Enter a valid email first" });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("/auth/forgot-password", {
        email: formData.email,
      });

      addToast({
        title: "Email Sent",
        description:
          response.data.message ||
          "Check your email for password reset instructions.",
        color: "success",
      });

      // Close Login Modal and Open Reset Password Modal
      setResetPasswordEmail(formData.email);
      setFormData({ email: "", password: "", otp: "" });
      setErrors({});
      onOpenChange(false);
      onResetPasswordClick(true);
    } catch (error) {
      const status = error.response?.status;
      const errorMessage =
        error.response?.data?.message || "Something went wrong.";

      if (status === 403) {
        setIsBlocked(true);
        addToast({
          title: "Account Deactivated",
          description: "Your account is deactivated. Please contact support.",
          color: "warning",
        });
      } else {
        addToast({
          title: "Request Failed",
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
              {step === "login" ? "Login" : "Verify OTP"}
            </ModalHeader>
            <ModalBody>
              {step === "login" ? (
                <>
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
                  <button
                    type="button"
                    className="text-sm text-primary cursor-pointer hover:underline bg-transparent border-none p-0 self-end"
                    onClick={handleForgotPassword}
                  >
                    Forgot Password?
                  </button>
                  {errorMessage && (
                    <p className="text-red-500 text-sm mb-2 flex items-center gap-x-2 leading-4">
                      <CircleAlertIcon /> {errorMessage}
                    </p>
                  )}
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
                </>
              )}
            </ModalBody>
            <ModalFooter>
              <Button
                color="danger"
                variant="flat"
                onPress={onClose}
                isDisabled={loading}
              >
                Close
              </Button>
              <Button
                color="primary"
                onPress={step === "login" ? handleLogin : handleVerifyOTP}
                isDisabled={loading}
                isLoading={loading}
              >
                {step === "login" ? "Login" : "Verify OTP"}
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
