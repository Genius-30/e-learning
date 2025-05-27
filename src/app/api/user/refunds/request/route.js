import dbConnect from "@/lib/dbConnect";
import { verifyJWT } from "@/middleware/verifyJWT";
import RefundRequest from "@/models/refundRequest.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function POST(req) {
  try {
    await dbConnect();
    const { courseId, reason } = await req.json();

    if (!courseId || !reason) {
      return ErrorResponse("Course ID and reason are required", 400);
    }

    // Authenticate user
    const user = await verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized", 401);

    // Check if user already requested a refund for this course
    const existingRequest = await RefundRequest.findOne({
      userId: user.id,
      courseId,
      status: "Pending",
    });

    if (existingRequest) {
      return ErrorResponse(
        "You have already requested a refund for this course",
        400
      );
    }

    // Create refund request
    const refundRequest = await RefundRequest.create({
      userId: user.id,
      courseId,
      reason,
    });

    return SuccessResponse("Refund request submitted successfully", {
      refundRequest,
    });
  } catch (error) {
    console.error("Error in refund request:", error);
    return ErrorResponse(error.message, 500);
  }
}
