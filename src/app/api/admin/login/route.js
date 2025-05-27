import { ErrorResponse } from "@/utils/responseUtils";
import { serialize } from "cookie";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    // Extract admin credentials from request
    const { adminId, password } = await req.json();

    // Validate input
    if (!adminId || !password) {
      return ErrorResponse("User ID and password are required", 400);
    }

    // Compare with .env admin credentials
    if (
      adminId !== process.env.ADMIN_ID ||
      password !== process.env.ADMIN_PASSWORD
    ) {
      return ErrorResponse("Invalid admin credentials", 401);
    }

    // Generate JWT token for admin authentication
    const token = jwt.sign(
      { adminId, role: "admin" },
      process.env.ADMIN_TOKEN_SECRET,
      { expiresIn: "7d" } // Admin token valid for 7 days
    );

    // Set cookie options
    const cookieOptions = {
      httpOnly: true, // Prevents client-side access
      secure: process.env.NODE_ENV === "production", // Secure only in production
      sameSite: "strict", // Protects against CSRF
      path: "/", // Available in all routes
      maxAge: 7 * 24 * 60 * 60, // 7 days
    };

    // Set the token as an HTTP-only cookie
    const cookie = serialize("adminToken", token, cookieOptions);

    return new Response(
      JSON.stringify({ message: "Admin login successful", token }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie, // Attach the cookie
        },
      }
    );
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
}
