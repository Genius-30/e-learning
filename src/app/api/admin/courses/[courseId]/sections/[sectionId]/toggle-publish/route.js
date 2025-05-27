import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Section from "@/models/section.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    // 🔐 Admin check
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    const { courseId, sectionId } = await params;
    if (!courseId || !sectionId)
      return ErrorResponse("Course ID and Section ID are required", 400);

    // 🔍 Find section
    const section = await Section.findOne({ _id: sectionId, courseId });
    if (!section) return ErrorResponse("Section not found", 404);

    // 🔁 Toggle isPublished
    section.isPublished = !section.isPublished;
    await section.save();

    return SuccessResponse(
      `Section has been ${section.isPublished ? "published" : "unpublished"}.`,
      { isPublished: section.isPublished }
    );
  } catch (error) {
    console.error("Error toggling publish status:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
