import { ErrorResponse } from "@/utils/responseUtils";
import { verifyToken } from "@/utils/tokenUtils";

export function verifyJWT(req) {
  try {
    const authHeader = req.headers.get("authorization");

    // 🔹 Check if authorization header is valid
    if (!authHeader?.startsWith("Bearer ")) {
      console.warn("Missing or invalid Authorization header");
      return null;
    }

    // 🔹 Extract token from Bearer header
    const token = authHeader.split(" ")[1];

    // 🔹 Verify access token
    const decoded = verifyToken(token, process.env.ACCESS_TOKEN_SECRET);

    if (!decoded) {
      console.warn("Token verification failed");
      return null;
    }

    if (decoded.isActive === false) {
      return ErrorResponse(
        "Your account is deactivated! Please contact support to login again.",
        403
      );
    }

    return decoded; // Return decoded user data (id, email, etc.)
  } catch (error) {
    console.error("JWT Verification Error:", error.message);
    return null;
  }
}
