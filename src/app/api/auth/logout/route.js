import dbConnect from "@/lib/dbConnect";
import sendEmail from "@/lib/sendEmail";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import { verifyToken } from "@/utils/tokenUtils";
import { cookies } from "next/headers";

export async function POST(req) {
  try {
    await dbConnect();

    // Extract user ID from JWT (instead of the request body)
    const token = await cookies().get("refreshToken")?.value;
    if (!token) {
      return ErrorResponse("No refresh token provided", 401);
    }

    const decoded = verifyToken(token, process.env.REFRESH_TOKEN_SECRET);
    if (!decoded) {
      return ErrorResponse("Invalid or expired token", 401);
    }

    const userId = decoded.id; // Get the id from JWT payload

    // Find user by ID
    const fetchedUser = await User.findById(userId).select("+refreshToken");
    if (!fetchedUser) {
      return ErrorResponse("User not found", 404);
    }

    // If already logged out, return success
    if (!fetchedUser.refreshToken) {
      return SuccessResponse("User already logged out");
    }

    // Clear refreshToken in DB
    fetchedUser.refreshToken = null;
    fetchedUser.isActive = false;
    await fetchedUser.save();

    await sendEmail({
      email: fetchedUser.email,
      subject: "Logout Successful",
      templateName: "logout",
      placeholders: {
        name: fetchedUser.name,
      },
    });

    // Clear refreshToken cookie
    const cookieStore = await cookies();
    cookieStore.set("refreshToken", "", {
      path: "/",
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
    });

    return SuccessResponse("User logged out successfully");
  } catch (error) {
    console.error("Logout Error:", error);
    return ErrorResponse("Internal server error", 500);
  }
}
