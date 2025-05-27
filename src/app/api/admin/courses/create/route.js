import { verifyAdmin } from "@/middleware/verifyAdmin";
import dbConnect from "@/lib/dbConnect";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import Course from "@/models/course.model";

export async function POST(req) {
  try {
    await dbConnect();

    // ✅ Authenticate Admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // 👀 Count existing Untitled Courses
    const untitledCourses = await Course.find({
      title: { $regex: /^Untitled( Course)? ?\d*$/i },
    });

    const nextNumber = untitledCourses.length + 1;
    const title = `Untitled Course ${nextNumber}`;

    const course = new Course({
      title,
      description: "",
      durationWeeks: 1,
      purchaseOptions: {},
    });

    await course.save();

    return SuccessResponse("Course created successfully", {
      courseId: course._id,
    });
  } catch (error) {
    console.error("Course draft create error", error);
    return ErrorResponse(
      "Something went wrong while creating the course draft",
      500
    );
  }
}
