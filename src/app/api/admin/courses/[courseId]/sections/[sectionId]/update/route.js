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
    if (!courseId || !sectionId) {
      return ErrorResponse("Course ID and Section ID are required", 400);
    }

    // 🔍 Find Section
    const section = await Section.findOne({ _id: sectionId, courseId });
    if (!section) return ErrorResponse("Section not found", 404);

    const { title, description } = await req.json();

    if (!title && !description) return ErrorResponse("Nothing to update", 400);

    // 📝 Update fields if provided
    if (title) section.title = title.trim();
    if (description) section.description = description.trim();

    await section.save();

    return SuccessResponse("Section updated successfully!", section);
  } catch (error) {
    console.error("Error updating section:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
