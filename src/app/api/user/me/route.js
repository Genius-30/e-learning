import { verifyJWT } from "@/middleware/verifyJWT";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function GET(req) {
  try {
    const user = await verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized access", 401);

    // Fetch only required fields (excluding sensitive data like passwords)
    const userData = await User.findById(user.id).select(
      "-password -refreshToken"
    );

    if (!userData) return ErrorResponse("User not found", 404);

    return SuccessResponse("User data retrieved successfully", {
      user: userData,
    });
  } catch (error) {
    console.error("Error in current user API:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
