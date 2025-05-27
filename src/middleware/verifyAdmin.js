import { verifyToken } from "@/utils/tokenUtils";

export function verifyAdmin(req) {
  try {
    const token =
      req.cookies?.get("adminToken")?.value ||
      req.headers.get("authorization")?.split(" ")[1];

    if (!token) {
      throw new Error("Admin token is required");
    }

    // 🔹 Decode and verify the admin token
    const decoded = verifyToken(token, process.env.ADMIN_TOKEN_SECRET);

    if (decoded.role !== "admin") {
      throw new Error("Access denied. Admins only.");
    }

    return decoded; // Return decoded admin details
  } catch (error) {
    throw new Error(error.message);
  }
}
