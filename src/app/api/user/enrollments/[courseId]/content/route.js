import dbConnect from "@/lib/dbConnect";
import { verifyJWT } from "@/middleware/verifyJWT";
import Section from "@/models/section.model";
import Enrollment from "@/models/enrollment.model";
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

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      userId: user.id,
      courseId,
    }).lean();

    if (!enrollment) {
      return ErrorResponse("You are not enrolled in this course", 403);
    }

    // Fetch sections and populate lectures
    const sections = await Section.find({
      courseId,
      isDeleted: false,
    })
      .sort({ index: 1 })
      .populate({
        path: "lectures",
        match: { isDeleted: false },
        options: { sort: { index: 1 } },
      })
      .lean();

    const completedLectureIds = new Set(
      enrollment.completedLectures.map((id) => id.toString())
    );

    const transformedSections = sections.map((section) => {
      const totalLectures = section.lectures.length;
      const totalLength = section.lectures.reduce(
        (sum, lecture) => sum + (lecture.duration || 0),
        0
      );

      const lectures = section.lectures.map((lecture) => ({
        _id: lecture._id,
        title: lecture.title,
        duration: lecture.duration,
        isCompleted: completedLectureIds.has(lecture._id.toString()),
      }));

      const idCompleted = lectures
        .filter((lec) => lec.isCompleted)
        .map((lec) => lec._id);

      const progress =
        totalLectures === 0
          ? 0
          : Math.round((idCompleted.length / totalLectures) * 100);

      return {
        _id: section._id,
        title: section.title,
        description: section.description,
        totalLectures,
        totalLength: Math.round((totalLength / 3600) * 100) / 100, // in hours
        idCompleted,
        progress,
        lectures,
      };
    });

    return SuccessResponse("Course content fetched", {
      sections: transformedSections,
    });
  } catch (error) {
    console.error("GET COURSE CONTENT ERROR:", error);
    return ErrorResponse("Something went wrong", 500);
  }
}
