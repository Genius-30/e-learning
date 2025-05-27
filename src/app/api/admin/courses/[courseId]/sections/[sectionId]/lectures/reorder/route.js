import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Course from "@/models/course.model";
import Lecture from "@/models/lecture.model";
import Section from "@/models/section.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    // 🔹 Verify Admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // 🔹 Extract Course & Section ID
    const { courseId, sectionId } = await params;
    if (!courseId || !sectionId)
      return ErrorResponse("Course ID and Section ID are required", 400);

    // 🔹 Parse Request Body
    const { orderedLectureIds } = await req.json();

    if (!Array.isArray(orderedLectureIds) || orderedLectureIds.length === 0) {
      return ErrorResponse("Invalid lecture order", 400);
    }

    // 🔹 Find the Course and Section (Optional Safety Check)
    const course = await Course.findById(courseId);
    if (!course) return ErrorResponse("Course not found", 404);

    const section = await Section.findById(sectionId);
    if (!section) return ErrorResponse("Section not found", 404);

    // 🔹 Fetch lectures to ensure they belong to the correct section
    const lectures = await Lecture.find({
      _id: { $in: orderedLectureIds },
      sectionId,
    });

    if (lectures.length !== orderedLectureIds.length) {
      return ErrorResponse("Some lectures do not belong to this section", 400);
    }

    // 🔹 Check for duplicate lectures in the new order
    const uniqueLectureIds = [...new Set(orderedLectureIds)];
    if (uniqueLectureIds.length !== orderedLectureIds.length) {
      return ErrorResponse("Duplicate lectures detected in the order", 400);
    }

    // 🔹 Bulk Update Lectures with New Indexes
    const bulkOps = orderedLectureIds.map((lectureId, index) => ({
      updateOne: {
        filter: { _id: lectureId },
        update: { index },
      },
    }));

    const bulkWriteResult = await Lecture.bulkWrite(bulkOps);

    if (bulkWriteResult.modifiedCount !== orderedLectureIds.length) {
      return ErrorResponse("Some lectures couldn't be updated.", 500);
    }

    return SuccessResponse("Lectures reordered successfully!");
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
}
