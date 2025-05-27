import dbConnect from "@/lib/dbConnect";
import { verifyJWT } from "@/middleware/verifyJWT";
import Enrollment from "@/models/enrollment.model";
import Section from "@/models/section.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const user = await verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized", 401);

    const { courseId } = await params;

    // Check if the user is enrolled
    const isEnrolled = await Enrollment.findOne({ userId: user.id, courseId });
    if (!isEnrolled) {
      return ErrorResponse("You are not enrolled in this course", 403);
    }

    // Fetch notes from all sections in the course
    const sections = await Section.find({ courseId })
      .select("title notesUrls")
      .sort({ index: 1 }) // optional: order by index
      .lean();

    return SuccessResponse("Notes fetched successfully", { sections });
  } catch (error) {
    console.error("GET NOTES ERROR", error);
    return ErrorResponse("Failed to fetch notes", 500);
  }
}
