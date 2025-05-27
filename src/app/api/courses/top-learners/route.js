import dbConnect from "@/lib/dbConnect";
import Enrollment from "@/models/enrollment.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function GET(req) {
  try {
    await dbConnect();

    // Fetch enrollments for the course
    const enrollments = await Enrollment.find()
      .populate("userId", "name")
      .populate("courseId", "title");

    // Get top learners (sorted by highest completion rate)
    if (enrollments.length === 0) {
      return SuccessResponse("No learners found", {
        topLearners: [],
      });
    }
    const topLearners = enrollments
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5) // Get top 5 learners
      .map((e) => ({
        userId: e.userId,
        name: e.userId.name,
        courseTitle: e.courseId.title,
        completionRate: e.progress,
      }));

    return SuccessResponse("Top learners retrieved successfully", {
      topLearners,
    });
  } catch (error) {
    console.log("Error in getTopLearners API:", error);
    return ErrorResponse("Internal server error", 500);
  }
}
