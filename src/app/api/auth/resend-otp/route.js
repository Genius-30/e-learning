import sendEmail from "@/lib/sendEmail";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import crypto from "crypto";

export async function POST(req) {
  try {
    await dbConnect();

    // Get the user input
    const { email } = await req.json();

    // Check if email is provided
    if (!email) {
      return ErrorResponse("Email is required", 400);
    }

    // Find the user by email
    const fetchedUser = await User.findOne({ email }).select("+otp +otpExpiry");
    if (!fetchedUser) {
      return ErrorResponse("User not found", 404);
    }

    // Prevent multiple OTP requests within validity period
    if (fetchedUser.otp && fetchedUser.otpExpiry > new Date()) {
      return ErrorResponse(
        "OTP already sent. Please wait before requesting a new one."
      );
    }

    // Generate OTP and set the expiry to 5 minutes
    const otp = crypto.randomInt(100000, 999999).toString();

    // Update the user with the new OTP and expiry
    await fetchedUser.setOtp(otp);

    await fetchedUser.save();

    const emailResponse = await sendEmail({
      email: fetchedUser.email,
      subject: "Here's the verification code for your account",
      templateName: "VerificationTemplate", // Stored in `emails/VerificationTemplate.html`
      placeholders: {
        name: fetchedUser.name,
        otp: otp,
      },
    });

    if (!emailResponse) {
      return ErrorResponse("Error sending email");
    }

    return SuccessResponse("OTP sent successfully", {
      user: fetchedUser,
    });
  } catch (error) {
    console.log(error);
    return ErrorResponse(error.message, 500);
  }
}
