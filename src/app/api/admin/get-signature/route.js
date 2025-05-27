import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import { generateSignature } from "@/utils/cloudinary";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function GET(req) {
  try {
    await dbConnect();

    // 🔹 Verify Admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // 🔹 Extract folder and resourceType from query parameters
    const { searchParams } = new URL(req.url);
    const folder = searchParams.get("folder") || "default";

    // 🔹 Validation or sanitization of parameters if needed
    if (!folder) {
      return ErrorResponse("Invalid parameters", 400);
    }

    // 🔹 Generate the signed URL
    const { signature, timestamp } = await generateSignature(folder);

    // 🔹 Return the signature
    return SuccessResponse("Signature generated successfully", {
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
    });
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
}
