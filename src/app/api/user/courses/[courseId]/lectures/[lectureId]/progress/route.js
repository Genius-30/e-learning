import dbConnect from "@/lib/dbConnect";
import Course from "@/models/course.model";
import Enrollment from "@/models/enrollment.model";
import WatchedProgress from "@/models/watchedProgress.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function POST(req, { params }) {
  await dbConnect();

  const {
    watchedDuration,
    userId,
    isLectureCompleted = false,
  } = await req.json();

  const { courseId, lectureId } = await params;

  if (!userId) {
    return ErrorResponse("User ID is required", 400);
  }
  if (typeof watchedDuration !== "number" || watchedDuration < 0) {
    return ErrorResponse("Invalid watchedDuration", 400);
  }

  try {
    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment)
      return ErrorResponse("You are not enrolled in this course", 403);

    // Fetch existing watchedProgress if exists
    const existingProgress = await WatchedProgress.findOne({
      user: userId,
      course: courseId,
      lecture: lectureId,
    });

    if (
      !existingProgress ||
      watchedDuration > (existingProgress.watchedDuration || 0)
    ) {
      await WatchedProgress.findOneAndUpdate(
        { user: userId, course: courseId, lecture: lectureId },
        {
          watchedDuration,
          isCompleted: isLectureCompleted,
        },
        { upsert: true, new: true }
      );
    }

    const updateEnrollment = {
      lastLectureId: lectureId,
      lastAccessedAt: new Date(),
    };

    if (isLectureCompleted) {
      const alreadyCompleted = enrollment.completedLectures.includes(lectureId);
      if (!alreadyCompleted) {
        enrollment.completedLectures.push(lectureId);
      }

      // Only fetch the course if needed
      const course = await Course.findById(courseId).populate({
        path: "sections",
        populate: {
          path: "lectures",
          select: "title duration",
        },
      });

      if (!course) return ErrorResponse("Course not found", 404);

      const totalLectures = course.sections.reduce(
        (acc, section) => acc + (section.lectures?.length || 0),
        0
      );

      const completedCount = enrollment.completedLectures.length;
      const progress = Math.floor((completedCount / totalLectures) * 100);

      updateEnrollment.completedLectures = enrollment.completedLectures;
      updateEnrollment.progress = progress;
      updateEnrollment.completed = progress === 100;
    }

    // Apply updates
    await Enrollment.updateOne(
      { userId, courseId },
      { $set: updateEnrollment }
    );

    // Return success response
    return SuccessResponse("Progress updated successfully!");
  } catch (error) {
    console.error("UPDATE LECTURE PROGRESS ERROR:", error);
    return ErrorResponse("Something went wrong", 500);
  }
}
