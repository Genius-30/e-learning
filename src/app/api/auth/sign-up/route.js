import sendEmail from "@/lib/sendEmail";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import crypto from "crypto";

export async function POST(req) {
  try {
    await dbConnect();

    // Get the user input
    const { name, email, password } = await req.json();

    // Check if the user already exists
    if (!name || !email || !password) {
      return ErrorResponse("Please enter all fields");
    }

    // Normalize the email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if the user already exists
    const existingUser = await User.findOne({ email: normalizedEmail }).select(
      "+otp +otpExpiry +password"
    );

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    let user;
    // Update the user details if the user already exists but not verified
    if (existingUser) {
      if (existingUser.isEmailVerified) {
        return ErrorResponse("User already exists");
      }

      // // Prevent multiple OTP requests within validity period
      // if (existingUser.otp && existingUser.otpExpiry > new Date()) {
      //   return ErrorResponse(
      //     "OTP already sent. Please wait before requesting a new one."
      //   );
      // }

      // Update the user details
      existingUser.name = name;
      existingUser.password = password;
      await existingUser.setOtp(otp);

      await existingUser.save();
      user = existingUser;
    } else {
      // Create a new user
      user = new User({
        name,
        email: normalizedEmail,
        password,
        isEmailVerified: false,
      });

      await user.setOtp(otp);
      await user.save();
    }

    // Send verification email
    const emailResponse = await sendEmail({
      email: normalizedEmail,
      subject: "Here's the verification code for your account",
      templateName: "VerificationTemplate",
      placeholders: { name, otp },
    });

    if (!emailResponse) {
      // If email sending fails, rollback user creation
      await User.deleteOne({ email: normalizedEmail });
      return ErrorResponse("Error sending email, please try again!");
    }

    // Filter only required user fields
    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    };

    // Return the response
    return SuccessResponse("Signup successful. Please verify your email!", {
      user: userResponse,
    });
  } catch (error) {
    console.error(error);
    return ErrorResponse("Internal server error", 500);
  }
}
