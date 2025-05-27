import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import { generateAccessToken, generateRefreshToken } from "@/utils/tokenUtils";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    await dbConnect();

    // Get email and otp from request body
    const { email, otp } = await req.json();

    // Check if email and otp are provided
    if (!email || !otp) {
      return ErrorResponse("Email and OTP are required", 400);
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find the user by email
    const fetchedUser = await User.findOne({ email: normalizedEmail }).select(
      "+otp +otpExpiry +isEmailVerified"
    );

    // Check if user exists
    if (!fetchedUser) {
      return ErrorResponse("User not found", 404);
    }

    // Check if OTP is expired
    if (fetchedUser.otpExpiry < new Date()) {
      return ErrorResponse("OTP expired", 400);
    }

    // Check if OTP is correct
    if (!(await fetchedUser.verifyOtp(otp))) {
      return ErrorResponse("Invalid OTP", 400);
    }

    // Update the user with the new OTP and expiry
    fetchedUser.isEmailVerified = true;
    fetchedUser.otp = null;
    fetchedUser.otpExpiry = null;

    // Update last login
    await fetchedUser.updateLastLogin();

    // Generate access & refresh tokens
    const accessToken = generateAccessToken(fetchedUser);
    const refreshToken = generateRefreshToken(fetchedUser);

    // Save refresh token in DB (only one active login at a time)
    fetchedUser.refreshToken = refreshToken;
    await fetchedUser.save();

    // Store refresh token in HttpOnly cookie
    const cookieStore = await cookies();
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      path: "/",
      maxAge: 28 * 24 * 60 * 60, // 28 days
    });

    return SuccessResponse("Email verified successfully", {
      user: {
        id: fetchedUser._id,
        name: fetchedUser.name,
        email: fetchedUser.email,
        isEmailVerified: fetchedUser.isEmailVerified,
      },
      accessToken,
    });
  } catch (error) {
    console.log("Error in verify OTP:", error);
    return ErrorResponse("Internal server error", 500);
  }
}
