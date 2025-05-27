import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Section from "@/models/section.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    // 🔐 Verify Admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    const { courseId, sectionId } = await params;
    if (!courseId || !sectionId)
      return ErrorResponse("Course ID and Section ID are required", 400);

    // Find the Section
    const section = await Section.findOne({ _id: sectionId, courseId });
    if (!section) return ErrorResponse("Section not found", 404);

    // Soft Delete
    section.isDeleted = true;
    await section.save();

    return SuccessResponse("Section deleted successfully (soft delete).", {
      sectionId,
      isDeleted: true,
    });
  } catch (error) {
    console.error("Error deleting section:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
