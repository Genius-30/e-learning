import dbConnect from "@/lib/dbConnect";
import Enrollment from "@/models/enrollment.model";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function DELETE(req) {
  try {
    await dbConnect();

    // 🔹 Verify Admin Access
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // 🔹 Extract User ID & Course ID from Request
    const { userId, courseId } = await req.json();
    if (!userId || !courseId)
      return ErrorResponse("User ID and Course ID are required", 400);

    // 🔹 Find & Delete Enrollment
    const deletedEnrollment = await Enrollment.findOneAndDelete({
      userId,
      courseId,
    });

    if (!deletedEnrollment) return ErrorResponse("Enrollment not found", 404);

    return SuccessResponse("User access revoked successfully");
  } catch (error) {
    console.error("Error revoking access:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
