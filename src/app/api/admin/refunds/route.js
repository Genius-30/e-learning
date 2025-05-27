import dbConnect from "@/lib/dbConnect";
import RefundRequest from "@/models/refundRequest.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import { verifyAdmin } from "@/middleware/verifyAdmin";

export async function GET(req) {
  try {
    await dbConnect();
    const admin = await verifyAdmin(req);

    if (!admin) return ErrorResponse("Unauthorized", 403);

    const refundRequests = await RefundRequest.find().populate(
      "userId courseId",
      "name email title"
    );
    return SuccessResponse("Refund requests retrieved", { refundRequests });
  } catch (error) {
    console.error("Error fetching refund requests:", error);
    return ErrorResponse(error.message, 500);
  }
}
