import dbConnect from "@/lib/dbConnect";
import { verifyJWT } from "@/middleware/verifyJWT";
import Enrollment from "@/models/enrollment.model";
import WatchedProgress from "@/models/watchedProgress.model";
import Course from "@/models/course.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  await dbConnect();
  const { courseId } = await params;

  try {
    const user = await verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized", 401);

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return ErrorResponse("Invalid course ID", 400);
    }

    const enrollment = await Enrollment.findOne({
      userId: user.id,
      courseId,
    });

    if (!enrollment) {
      return ErrorResponse("You are not enrolled in this course", 403);
    }

    // Find the most recently watched lecture by this user
    const lastWatched = await WatchedProgress.findOne({
      user: user.id,
      course: courseId,
    })
      .sort({ updatedAt: -1 })
      .select("lecture")
      .lean();

    if (lastWatched?.lecture) {
      return SuccessResponse("Last watched lecture found", {
        lastLectureId: lastWatched.lecture.toString(),
      });
    }

    // If no watched lecture, return the first lecture in the course
    const course = await Course.findById(courseId)
      .populate({
        path: "sections.lectures",
        match: { isDeleted: false },
        options: { sort: { index: 1 } },
      })
      .lean();

    const firstLecture = course?.sections?.[0]?.lectures?.[0];

    if (!firstLecture) {
      return ErrorResponse("No lectures found in this course", 404);
    }

    return SuccessResponse("First lecture found", {
      lastLectureId: firstLecture._id.toString(),
    });
  } catch (error) {
    console.error("GET LAST LECTURE ERROR:", error);
    return ErrorResponse("Something went wrong", 500);
  }
}
