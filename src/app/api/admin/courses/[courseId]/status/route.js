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

    // 🔹 Extract Course ID
    const { courseId } = await params;
    if (!courseId) return ErrorResponse("Course ID is required", 400);

    // 🔹 Find Course
    const course = await Course.findById(courseId);
    if (!course) return ErrorResponse("Course not found", 404);

    // ✅ Toggle logic (from frontend switch)
    const { status } = await req.json(); // status: "published" | "draft"

    if (!["published", "draft"].includes(status))
      return ErrorResponse("Invalid status value.", 400);

    if (status === "published") {
      const sections = await Section.find({ courseId }).populate("lectures", {
        title: 1,
      });

      const hasContent =
        sections.length > 0 && sections.some((sec) => sec.lectures.length > 0);

      if (!hasContent) {
        return ErrorResponse(
          "Cannot publish an empty course. Add sections and lectures first.",
          400
        );
      }
    }

    course.status = status;
    await course.save();

    return SuccessResponse(
      `Course ${
        status == "published" ? "published" : "saved as draft"
      } successfully!`,
      {
        status: course.status,
      }
    );
  } catch (error) {
    console.error("Error updating course status:", error);
    return ErrorResponse(error.message, 500);
  }
}
