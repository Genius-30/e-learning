import dbConnect from "@/lib/dbConnect";
import { verifyJWT } from "@/middleware/verifyJWT";
import Enrollment from "@/models/enrollment.model";
import WatchedProgress from "@/models/watchedProgress.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const user = await verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized", 401);

    const { courseId } = await params;
    if (!courseId) return ErrorResponse("Course ID is required", 400);

    // Fetch the user's enrollment for this course
    const enrollment = await Enrollment.findOne({
      userId: user.id,
      courseId,
    }).populate("courseId");

    if (!enrollment) {
      return ErrorResponse("Enrollment not found", 404);
    }

    const course = enrollment.courseId;
    const totalLectures = course.sections.reduce(
      (acc, section) => acc + section.lectures.length,
      0
    );

    // Fetch user's watched lectures for this course
    const watched = await WatchedProgress.find({
      user: user.id,
      course: courseId,
    }).populate("lecture");

    const completedLectures = watched.filter((w) => w.isCompleted);
    const completedLecturesCount = completedLectures.length;

    const progress =
      totalLectures > 0
        ? Math.min((completedLecturesCount / totalLectures) * 100, 100)
        : 0;

    return SuccessResponse("Enrollment fetched successfully!", {
      enrollmentId: enrollment._id,
      courseId: enrollment.courseId,
      userId: enrollment.userId,
      completedLectures: completedLectures.map((c) => c.lecture),
      progress,
      watchedProgress: watched,
      enrolledAt: enrollment.enrolledAt,
      lastAccessedAt: enrollment.lastAccessedAt,
      lastLectureId: enrollment.lastLectureId,
    });
  } catch (error) {
    console.error(error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
