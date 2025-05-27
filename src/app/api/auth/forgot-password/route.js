import sendEmail from "@/lib/sendEmail";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import crypto from "crypto";

export async function POST(req) {
  try {
    await dbConnect();

    // Get email from request body
    const { email } = await req.json();

    // Check if email is provided
    if (!email) {
      return ErrorResponse("Email is required", 400);
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const fetchedUser = await User.findOne({ email: normalizedEmail }).select(
      "+otp +otpExpiry +isActive +isEmailVerified"
    );

    if (!fetchedUser) {
      return ErrorResponse("Invalid email", 400);
    }

    // Check if user is active
    if (!fetchedUser.isActive) {
      return ErrorResponse("Your account is deactivated. Contact admin.", 403);
    }

    // Check if user is verified
    if (!fetchedUser.isEmailVerified) {
      return ErrorResponse("Please verify your email", 400);
    }

    // Generate otp
    const otp = crypto.randomInt(100000, 999999).toString();

    // set otp and expiry
    fetchedUser.setOtp(otp);
    await fetchedUser.save();

    // Send reset password email
    await sendEmail({
      email: fetchedUser.email,
      subject: "Reset your password",
      templateName: "ResetPasswordTemplate",
      placeholders: {
        name: fetchedUser.name,
        otp,
      },
    });

    return SuccessResponse("Reset password otp sent to your email");
  } catch (error) {
    console.log(error);
    return ErrorResponse(error.message, 500);
  }
}
