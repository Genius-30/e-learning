import dbConnect from "@/lib/dbConnect";
import Payment from "@/models/payment.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import { verifyAdmin } from "@/middleware/verifyAdmin";

export async function GET(req) {
  try {
    await dbConnect();

    // 🔹 Verify Admin
    const admin = verifyAdmin(req);

    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // 🔹 Extract Query Parameters
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;

    // 🔹 Build Filter Conditions
    let filter = {};

    if (status) {
      if (!["success", "failed"].includes(status)) {
        return ErrorResponse(
          "Invalid status filter. Use 'success' or 'failed'.",
          400
        );
      }
      filter.status = status;
    }

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // 🔹 Convert page & limit to numbers
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    // 🔹 Fetch Payments
    const payments = await Payment.find(filter)
      .populate("userId", "name email")
      .populate("courseId", "title price")
      .sort({ createdAt: -1 }) // Newest first
      .skip(skip)
      .limit(limitNumber);

    const totalPayments = await Payment.countDocuments(filter);

    return SuccessResponse("Payment history fetched successfully", {
      payments,
      page: pageNumber,
      totalPages: Math.ceil(totalPayments / limitNumber),
      totalPayments,
    });
  } catch (error) {
    console.error("Error fetching payment history:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
