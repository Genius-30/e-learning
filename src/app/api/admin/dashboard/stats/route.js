import dbConnect from "@/lib/dbConnect";
import Enrollment from "@/models/enrollment.model";
import User from "@/models/user.model";
import Course from "@/models/course.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import moment from "moment";

export async function GET(req) {
  try {
    await dbConnect();

    // Verify if the user is an admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized", 401);

    const startOfMonth = moment().startOf("month").toDate();
    const prevStartOfMonth = moment()
      .subtract(1, "months")
      .startOf("month")
      .toDate();

    // Total courses
    const totalCourses = await Course.countDocuments();
    const newCourses = await Course.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // Active users (users who logged in this month)
    const activeUsers = await User.countDocuments({
      lastLogin: { $gte: startOfMonth },
    });
    const prevActiveUsers = await User.countDocuments({
      lastLogin: { $gte: prevStartOfMonth, $lt: startOfMonth },
    });

    // Total students
    const totalStudents = await User.countDocuments();
    const newStudents = await User.countDocuments({
      createdAt: { $gte: startOfMonth },
    });

    // New enrollments this month
    const newEnrollments = await Enrollment.countDocuments({
      createdAt: { $gte: startOfMonth },
    });
    const prevEnrollments = await Enrollment.countDocuments({
      createdAt: { $gte: prevStartOfMonth, $lt: startOfMonth },
    });

    return SuccessResponse("Dashboard stats fetched successfully", {
      totalCourses,
      newCourses,
      activeUsers,
      newActiveUsers: activeUsers - prevActiveUsers,
      totalStudents,
      newStudents,
      newEnrollments,
      enrollmentGrowth: newEnrollments - prevEnrollments,
    });
  } catch (error) {
    console.log("Error in dashboard stats API:", error);
    return ErrorResponse("Internal server error", 500);
  }
}
