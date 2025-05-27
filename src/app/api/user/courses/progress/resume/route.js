import dbConnect from "@/lib/dbConnect";
import { verifyJWT } from "@/middleware/verifyJWT";
import { ErrorResponse } from "@/utils/responseUtils";

// ✅ RESUME FEATURE (LAST COMPLETED LECTURE)
export async function GET(req) {
  try {
    await dbConnect();

    // 🔹 Verify User
    const user = verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized access", 403);

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");
    if (!courseId) return ErrorResponse("Course ID is required", 400);

    // 🔹 Fetch Enrollment
    const enrollment = await Enrollment.findOne({
      userId: user._id,
      courseId,
    }).populate("completedLectures");
    if (!enrollment)
      return ErrorResponse("You are not enrolled in this course", 404);

    // 🔹 Get Last Completed Lecture
    const lastCompletedLecture =
      enrollment.completedLectures[enrollment.completedLectures.length - 1] ||
      null;

    return SuccessResponse("Resume progress fetched", { lastCompletedLecture });
  } catch (error) {
    console.error("Error fetching resume progress:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
