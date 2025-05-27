import dbConnect from "@/lib/dbConnect";
import { verifyJWT } from "@/middleware/verifyJWT";
import Enrollment from "@/models/enrollment.model";
import Lecture from "@/models/lecture.model";
import WatchedProgress from "@/models/watchedProgress.model";
import { generateSecureVideoUrl } from "@/utils/cloudinary";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  await dbConnect();
  const { courseId, lectureId } = await params;

  try {
    const user = await verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized", 401);

    // Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lectureId)
    ) {
      return ErrorResponse("Invalid course or lecture ID", 400);
    }

    const lecture = await Lecture.findById(lectureId).lean();

    if (!lecture || lecture.isDeleted)
      return ErrorResponse("Lecture not found", 404);

    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({ userId: user.id, courseId });
    if (!enrollment)
      return ErrorResponse("You are not enrolled in this course", 403);

    // Generate secure video URL
    lecture.videoUrl = generateSecureVideoUrl(lecture.publicId);

    // Fetch watched progress
    const watchedProgress = await WatchedProgress.findOne({
      user: user.id,
      course: courseId,
      lecture: lectureId,
    }).lean();

    const watchedDuration = watchedProgress?.watchedDuration || 0;

    return SuccessResponse("Lecture fetched!", {
      lecture,
      watchedDuration,
      isCompleted: watchedProgress?.isCompleted || false,
    });
  } catch (error) {
    console.error("GET LECTURE ERROR:", error);
    return ErrorResponse("Something went wrong", 500);
  }
}
