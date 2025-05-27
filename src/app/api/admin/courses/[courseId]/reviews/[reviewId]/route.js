import { verifyAdmin } from "@/middleware/verifyAdmin";
import Review from "@/models/review.model";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { courseId, reviewId } = await params;

    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized", 401);

    const review = await Review.findOne({ _id: reviewId, courseId });
    if (!review) return ErrorResponse("Review not found", 404);

    await Review.findByIdAndDelete(reviewId);

    return SuccessResponse("Review deleted successfully");
  } catch (error) {
    console.log("Error in adminDeleteReview API:", error);
    return ErrorResponse("Internal server error", 500);
  }
}
