import { verifyAdmin } from "@/middleware/verifyAdmin";
import dbConnect from "@/lib/dbConnect";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import Payment from "@/models/payment.model";
import moment from "moment";

export async function GET(req) {
  try {
    await dbConnect();

    // Verify if the user is an admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized", 401);

    // Fetch Payments & Group by Month
    const payments = await Payment.find({}, { amountPaid: 1, createdAt: 1 });

    // Aggregate revenue per month
    const revenueData = payments.reduce((acc, payment) => {
      const month = moment(payment.createdAt).format("MMM"); // e.g., "Jan", "Feb"
      acc[month] = (acc[month] || 0) + payment.amountPaid;
      return acc;
    }, {});

    // Convert to array format (sorted)
    const formattedData = Object.entries(revenueData).map(
      ([month, revenue]) => ({
        month,
        revenue,
      })
    );

    return SuccessResponse("Revenue data fetched successfully", {
      revenueData: formattedData,
    });
  } catch (error) {
    console.error("Revenue Fetch Error:", error);
    return ErrorResponse("Internal server error", 500);
  }
}
