import dbConnect from "@/lib/dbConnect";
import Enrollment from "@/models/enrollment.model";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import dayjs from "dayjs";

export async function GET(req) {
  try {
    await dbConnect();

    // 🔹 Verify Admin Access
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // 🔹 Extract Query Parameters Correctly in Next.js App Router
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const courseId = searchParams.get("courseId");
    const month = searchParams.get("month");
    const year = searchParams.get("year");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // 🔹 Build Filter Object
    let filter = {};

    if (userId) filter.userId = userId;
    if (courseId) filter.courseId = courseId;

    if (month && year) {
      const startOfMonth = dayjs(`${year}-${month}-01`)
        .startOf("month")
        .toDate();
      const endOfMonth = dayjs(`${year}-${month}-01`).endOf("month").toDate();
      filter.createdAt = { $gte: startOfMonth, $lte: endOfMonth };
    }

    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // 🔹 Fetch Enrollments
    const enrollments = await Enrollment.find(filter)
      .populate({ path: "userId", select: "name email" })
      .populate({ path: "courseId", select: "title duration price" })
      .sort({ createdAt: -1 });

    return SuccessResponse("Enrollments fetched successfully", enrollments);
  } catch (error) {
    console.error("Error fetching enrollments:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
