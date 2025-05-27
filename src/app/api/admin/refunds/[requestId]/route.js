import dbConnect from "@/lib/dbConnect";
import RefundRequest from "@/models/refundRequest.model";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import sendEmail from "@/lib/sendEmail";
import { verifyAdmin } from "@/middleware/verifyAdmin";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();
    const { requestId } = params;
    const { status, adminResponse } = await req.json();

    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized", 403);

    if (!["Approved", "Rejected"].includes(status)) {
      return ErrorResponse("Invalid status", 400);
    }

    const refundRequest = await RefundRequest.findById(requestId).populate(
      "userId",
      "email name"
    );
    if (!refundRequest) return ErrorResponse("Refund request not found", 404);

    refundRequest.status = status;
    refundRequest.adminResponse = adminResponse || null;
    refundRequest.reviewedAt = new Date();
    await refundRequest.save();

    // 📨 Send Email Notification
    await sendEmail({
      email: refundRequest.userId.email,
      subject: `Refund Request ${status}`,
      templateName: "RefundResponseTemplate",
      placeholders: {
        name: refundRequest.userId.name,
        status,
        adminResponse: adminResponse || "No additional comments",
      },
    });

    return SuccessResponse("Refund request updated & user notified via email", {
      refundRequest,
    });
  } catch (error) {
    console.error("Error updating refund request:", error);
    return ErrorResponse(error.message, 500);
  }
}
