import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/payment.model";
import User from "@/models/user.model";
import Course from "@/models/course.model";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function GET(req) {
  try {
    await dbConnect();

    // Verify if the user is an admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized", 401);

    // Fetch recent successful payments with user & course details
    const recentSales = await Payment.find({ paymentStatus: "success" })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate({
        path: "userId",
        select: "name email",
        model: User,
      })
      .populate({
        path: "courseId",
        select: "title",
        model: Course,
      })
      .lean();

    return SuccessResponse("Recent sales fetched successfully", {
      recentSales: recentSales.map((sale) => ({
        id: sale._id,
        user: {
          name: sale.userId.name,
          email: sale.userId.email,
        },
        course: {
          title: sale.courseId.title,
        },
        amount: sale.amountPaid,
        date: sale.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching recent sales:", error);
    return ErrorResponse("Failed to fetch recent sales", 500);
  }
}
