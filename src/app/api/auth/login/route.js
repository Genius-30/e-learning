import sendEmail from "@/lib/sendEmail";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import crypto from "crypto";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, password } = await req.json();

    if (!email || !password)
      return ErrorResponse("Email and password are required", 400);

    const normalizedEmail = email.toLowerCase().trim();
    const fetchedUser = await User.findOne({ email: normalizedEmail })
      .select("+password +failedAttempts +refreshToken +otp +otpExpiry")
      .exec();

    if (!fetchedUser) return ErrorResponse("Invalid email or password", 400);

    if (!fetchedUser.isActive) {
      return ErrorResponse(
        "Your account is deactivated. Contact admin.",
        403,
        "ACCOUNT_DEACTIVATED"
      );
    }

    if (!fetchedUser.isEmailVerified)
      return ErrorResponse("Please verify your email", 400);

    // Brute-force protection
    if (fetchedUser.failedAttempts >= 5) {
      const otp = crypto.randomInt(100000, 999999).toString();
      await fetchedUser.setOtp(otp);
      fetchedUser.failedAttempts = 0;
      await fetchedUser.save();

      await sendEmail({
        email: fetchedUser.email,
        subject: "Too many failed login attempts - Reset your password",
        templateName: "ResetPasswordTemplate",
        placeholders: {
          name: fetchedUser.name,
          otp,
        },
      });
      return ErrorResponse(
        "Too many failed attempts. Reset your password.",
        403
      );
    }

    // One-login-at-a-time restriction
    if (fetchedUser.refreshToken) {
      return ErrorResponse(
        "You are already logged in. Please log out first.",
        403,
        "ALREADY_LOGGED_IN"
      );
    }

    // Check password
    const isPasswordCorrect = await fetchedUser.comparePassword(password);
    if (!isPasswordCorrect) {
      fetchedUser.failedAttempts += 1;
      await fetchedUser.save();
      return ErrorResponse("Invalid email or password", 400);
    }

    fetchedUser.failedAttempts = 0;

    const otp = crypto.randomInt(100000, 999999).toString();
    await fetchedUser.setOtp(otp);
    await fetchedUser.save();

    await sendEmail({
      email: fetchedUser.email,
      subject: "Your OTP for Login",
      templateName: "LoginOTPTemplate",
      placeholders: { name: fetchedUser.name, otp },
    });

    return SuccessResponse("OTP sent to your email");
  } catch (error) {
    console.log(error);
    return ErrorResponse(error.message, 500);
  }
}
