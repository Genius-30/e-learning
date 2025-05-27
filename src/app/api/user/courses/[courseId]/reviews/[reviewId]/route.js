import Filter from "bad-words";
import dbConnect from "@/lib/dbConnect";
import Review from "@/models/review.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import { verifyJWT } from "@/middleware/verifyJWT";

export async function PUT(req) {
  try {
    await dbConnect();

    const user = await verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized", 401);

    const { reviewId, rating, comment } = await req.json();

    if (!reviewId || !rating || !comment) {
      return ErrorResponse("All fields are required", 400);
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return ErrorResponse("Review not found", 404);
    }

    if (review.userId.toString() !== user._id.toString()) {
      return ErrorResponse("Unauthorized to edit this review", 403);
    }

    // Initialize bad words filter
    const filter = new Filter();
    const sanitizedComment = filter.clean(comment); // Replaces bad words with ****

    if (rating) review.rating = rating;
    if (comment) review.comment = sanitizedComment;
    await review.save();

    return SuccessResponse("Review updated successfully", { review });
  } catch (error) {
    console.log("Error in updating review:", error);
    return ErrorResponse(error.message, 500);
  }
}
