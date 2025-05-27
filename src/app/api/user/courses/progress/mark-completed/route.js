import dbConnect from "@/lib/dbConnect";
import Enrollment from "@/models/enrollment.model";
import Course from "@/models/course.model";
import { verifyJWT } from "@/middleware/verifyJWT";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import mongoose from "mongoose";

// ✅ MARK LECTURE AS COMPLETED
export async function POST(req) {
  try {
    await dbConnect();

    // 🔹 Verify User
    const user = verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized access", 403);

    // 🔹 Extract Data
    const { courseId, lectureId } = await req.json();
    if (!courseId || !lectureId) {
      return ErrorResponse("Course ID and Lecture ID are required", 400);
    }

    // 🔹 Validate ObjectIds
    if (
      !mongoose.Types.ObjectId.isValid(courseId) ||
      !mongoose.Types.ObjectId.isValid(lectureId)
    ) {
      return ErrorResponse("Invalid Course ID or Lecture ID", 400);
    }

    // 🔹 Check Enrollment
    const enrollment = await Enrollment.findOne({ userId: user._id, courseId });
    if (!enrollment)
      return ErrorResponse("You are not enrolled in this course", 404);

    // 🔹 Avoid Duplicate Lecture Completions
    if (enrollment.completedLectures.includes(lectureId)) {
      return ErrorResponse("Lecture already marked as completed", 400);
    }

    // 🔹 Add Lecture to Completed List
    enrollment.completedLectures.push(lectureId);

    // 🔹 Update Progress
    const course = await Course.findById(courseId).populate(
      "sections.lectures"
    );
    if (!course) return ErrorResponse("Course not found", 404);

    const totalLectures = course.sections.flatMap((s) => s.lectures).length;
    const completedLectures = enrollment.completedLectures.length;
    enrollment.progress = Math.round((completedLectures / totalLectures) * 100);

    // 🔹 Mark Course as Completed if Progress is 100%
    if (enrollment.progress === 100) {
      enrollment.completed = true;
    }

    await enrollment.save();
    return SuccessResponse("Lecture marked as completed!", {
      progress: enrollment.progress,
      completed: enrollment.completed,
    });
  } catch (error) {
    console.error("Error marking lecture as completed:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}

// ✅ GET COURSE PROGRESS
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
      userId: user.id,
      courseId,
    }).populate({
      path: "completedLectures",
      select: "title", // Return lecture titles only
    });

    if (!enrollment)
      return ErrorResponse("You are not enrolled in this course", 404);

    return SuccessResponse("Course progress fetched", {
      progress: enrollment.progress,
      completed: enrollment.completed,
      completedLectures: enrollment.completedLectures,
    });
  } catch (error) {
    console.error("Error fetching progress:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
