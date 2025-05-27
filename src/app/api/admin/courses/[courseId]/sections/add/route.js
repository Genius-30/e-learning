import { verifyAdmin } from "@/middleware/verifyAdmin";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import Course from "@/models/course.model";
import Section from "@/models/section.model";
import dbConnect from "@/lib/dbConnect";

export async function POST(req, { params }) {
  try {
    await dbConnect();

    // Verify admin access
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // Validate input
    const { courseId } = await params;
    if (!courseId) return ErrorResponse("Course ID is required", 400);

    const { title, description } = await req.json();
    if (!title.trim()) return ErrorResponse("Section title is required", 400);

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) return ErrorResponse("Course not found", 404);

    // Get Last Section's Index (to maintain order)
    const lastSection = await Section.findOne({ courseId }).sort("-index");
    const index = lastSection ? lastSection.index + 1 : 0; // Next available index

    // Create a new section
    const newSection = new Section({
      courseId,
      title: title.trim(),
      description: description.trim() || "",
      index,
      lectures: [],
      notesUrls: [],
      isPublished: true,
    });
    await newSection.save();

    // Update course with the new section ID
    course.sections.push(newSection._id);
    await course.save();

    return SuccessResponse(
      "Section added successfully!",
      newSection.toObject()
    );
  } catch (error) {
    console.error("Error uploading section:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
