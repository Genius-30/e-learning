import dbConnect from "@/lib/dbConnect";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import { generateAccessToken, verifyToken } from "@/utils/tokenUtils";

export async function GET(req) {
  try {
    await dbConnect();

    // Get the refresh token from the cookies
    const refreshToken = req.cookies.get("refreshToken")?.value;

    // If the refresh token is not present, return an error
    if (!refreshToken) {
      return ErrorResponse("Refresh token is missing", 401);
    }

    // Verify the refresh token
    const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    if (!decoded) {
      return ErrorResponse("Invalid or expired refresh token", 403);
    }

    // find user
    const fetchedUser = await User.findById(decoded.id);

    if (!fetchedUser) {
      return ErrorResponse("User not found", 404);
    }

    if (!fetchedUser?.isActive) {
      return ErrorResponse("Your account is deactivated ", 403);
    }

    if (!fetchedUser.isEmailVerified) {
      return ErrorResponse("Your email is not verified", 403);
    }

    // Generate a new access token
    const accessToken = generateAccessToken(fetchedUser);

    return SuccessResponse("Access token refreshed", { accessToken });
  } catch (error) {
    console.log(error);
    return ErrorResponse(error.message, 500);
  }
}
