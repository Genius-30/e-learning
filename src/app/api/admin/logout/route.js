import { ErrorResponse } from "@/utils/responseUtils";
import { serialize } from "cookie";

export async function POST() {
  try {
    // Set the adminToken cookie to an empty value with an immediate expiration
    const cookie = serialize("adminToken", "", {
      httpOnly: true, // Prevent client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      expires: new Date(0),
    });

    return new Response(
      JSON.stringify({ message: "Admin logout successful" }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": cookie,
        },
      }
    );
  } catch (error) {
    console.error("Logout Error:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
