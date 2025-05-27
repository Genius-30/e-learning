import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function POST(req) {
  try {
    await dbConnect();
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return ErrorResponse("All fields are required", 400);
    }

    const fetchedUser = await User.findOne({ email }).select(
      "+password +otp +otpExpiry +isActive"
    );

    if (!fetchedUser) {
      return ErrorResponse("User not found", 404);
    }

    // If the user is not active, return an error response
    if (!fetchedUser.isActive) {
      return ErrorResponse("Your account is deactivated. Contact admin.", 403);
    }

    // Check if OTP is valid and not expired
    if (fetchedUser.otp !== otp || fetchedUser.otpExpiry < Date.now()) {
      return ErrorResponse("Invalid or expired OTP", 400);
    }

    // Update password
    fetchedUser.password = newPassword;
    fetchedUser.otp = null;
    fetchedUser.otpExpiry = null;
    await fetchedUser.save();

    return SuccessResponse("Password reset successful");
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
}
