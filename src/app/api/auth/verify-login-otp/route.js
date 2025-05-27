import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import { generateAccessToken, generateRefreshToken } from "@/utils/tokenUtils";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    await dbConnect();

    // Get email and OTP from request body
    const { email, otp } = await req.json();

    // Check if email and OTP are provided
    if (!email || !otp) {
      return ErrorResponse("Email and OTP are required", 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find the user by email
    const fetchedUser = await User.findOne({ email: normalizedEmail }).select(
      "+otp +otpExpiry +refreshToken"
    );

    // Check if user exists
    if (!fetchedUser) {
      return ErrorResponse("User not found", 404);
    }

    // ✅ Check if OTP is expired first
    if (Date.now() > fetchedUser.otpExpiry) {
      return ErrorResponse("OTP expired", 400);
    }

    // ✅ Verify OTP
    if (!(await fetchedUser.verifyOtp(otp))) {
      return ErrorResponse("Invalid OTP", 400);
    }

    // Update last login
    await fetchedUser.updateLastLogin();

    // Clear OTP after successful verification
    fetchedUser.otp = null;
    fetchedUser.otpExpiry = null;

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

    return SuccessResponse("OTP verified successfully. Login successful!", {
      user: {
        id: fetchedUser._id,
        name: fetchedUser.name,
        email: fetchedUser.email,
        isEmailVerified: fetchedUser.isEmailVerified,
      },
      accessToken,
    });
  } catch (error) {
    console.log("Error in verifyLoginOtp:", error);
    return ErrorResponse(error.message, 500);
  }
}
