import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Enrollment from "@/models/enrollment.model";

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { courseId } = await params;

    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized", 401);

    // Fetch all enrollments for the course
    const enrollments = await Enrollment.find({ courseId });

    if (!enrollments.length) {
      return ErrorResponse("No enrollments found for this course", 404);
    }

    // Calculate average completion rate
    const totalCompletion = enrollments.reduce(
      (sum, e) => sum + e.completionRate,
      0
    );
    const avgCompletionRate = totalCompletion / enrollments.length;

    // Get top learners (sorted by highest completion rate)
    const topLearners = enrollments
      .sort((a, b) => b.completionRate - a.completionRate)
      .slice(0, 5) // Get top 5 learners
      .map((e) => ({
        userId: e.userId,
        completionRate: e.completionRate,
      }));

    return SuccessResponse("Course stats retrieved successfully", {
      totalEnrollments: enrollments.length,
      avgCompletionRate,
      topLearners,
    });
  } catch (error) {
    console.log("Error in getCourseStats API:", error);
    return ErrorResponse("Internal server error", 500);
  }
}
