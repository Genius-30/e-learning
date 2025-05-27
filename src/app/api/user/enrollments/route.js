import dbConnect from "@/lib/dbConnect";
import { verifyJWT } from "@/middleware/verifyJWT";
import Enrollment from "@/models/enrollment.model";
import Section from "@/models/section.model";
import Lecture from "@/models/lecture.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import WatchedProgress from "@/models/watchedProgress.model";

export async function GET(req) {
  try {
    await dbConnect();

    // 🔹 Verify User
    const user = await verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized access", 401);

    // 🔹 Get All Enrollments for User
    const enrollments = await Enrollment.find({ userId: user.id })
      .populate({
        path: "courseId",
        select: "_id title thumbnail",
      })
      .sort({ lastAccessedAt: -1 });

    const results = [];

    for (const enrollment of enrollments) {
      const courseId = enrollment.courseId._id;

      // 🔸 Get all sections of the course
      const sections = await Section.find({ courseId }).sort({ index: 1 });

      // 🔸 Get first lecture of the first section
      let firstLecture = null;
      if (sections.length > 0) {
        const firstSection = sections[0];
        firstLecture = await Lecture.findOne({
          sectionId: firstSection._id,
        }).sort({ index: 1 });
      }

      // 🔸 Determine last accessed lecture (fallback to first lecture)
      let lectureToShow = firstLecture;
      let watchedDuration = 0;

      if (enrollment.lastLectureId) {
        const lastLecture = await Lecture.findById(enrollment.lastLectureId);

        if (lastLecture) {
          lectureToShow = lastLecture;

          // Get watchedDuration from WatchedProgress model
          const progress = await WatchedProgress.findOne({
            user: user.id,
            course: courseId,
            lecture: lastLecture._id,
          });

          if (progress) {
            watchedDuration = progress.watchedDuration || 0;
          }
        }
      }

      results.push({
        _id: enrollment._id,
        courseId,
        title: enrollment.courseId.title,
        thumbnail: enrollment.courseId.thumbnail,
        progress: enrollment.progress,
        completed: enrollment.completed,
        enrolledAt: enrollment.enrolledAt,
        lastAccessedAt: enrollment.lastAccessedAt,
        lastLecture: lectureToShow
          ? {
              _id: lectureToShow._id,
              title: lectureToShow.title,
              duration: lectureToShow.duration,
              watchedDuration,
            }
          : null,
      });
    }

    return SuccessResponse("My Learnings fetched successfully", {
      enrollments: results,
    });
  } catch (error) {
    console.error("Error fetching my learnings:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
