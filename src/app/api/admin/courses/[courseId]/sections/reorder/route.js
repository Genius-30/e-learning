import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Course from "@/models/course.model";
import Section from "@/models/section.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    // 🔹 Verify Admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // 🔹 Extract Course ID from Params
    const { courseId } = await params;
    if (!courseId) return ErrorResponse("Course ID is required", 400);

    // 🔹 Parse Request Body (new order)
    const { orderedSectionIds } = await req.json();

    if (!Array.isArray(orderedSectionIds) || orderedSectionIds.length === 0) {
      return ErrorResponse("Invalid section order", 400);
    }

    // 🔹 Find the Course
    const course = await Course.findById(courseId);
    if (!course) return ErrorResponse("Course not found", 404);

    // 🔹 Fetch all sections to ensure they belong to the same course (Optional Safety Check)
    const sections = await Section.find({
      _id: { $in: orderedSectionIds },
      courseId,
    });

    if (sections.length !== orderedSectionIds.length) {
      return ErrorResponse("Some sections do not belong to this course", 400);
    }

    // Optionally: Check for duplicate sections in the new order
    const uniqueSectionIds = [...new Set(orderedSectionIds)];
    if (uniqueSectionIds.length !== orderedSectionIds.length) {
      return ErrorResponse("Duplicate sections detected in the order", 400);
    }

    // 🔹 Bulk Update Sections with New Indexes
    const bulkOps = orderedSectionIds.map((sectionId, index) => ({
      updateOne: {
        filter: { _id: sectionId },
        update: { index },
      },
    }));

    const bulkWriteResult = await Section.bulkWrite(bulkOps);

    if (bulkWriteResult.modifiedCount !== orderedSectionIds.length) {
      return ErrorResponse("Some sections couldn't be updated.", 500);
    }

    return SuccessResponse("Sections reordered successfully!");
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
}
