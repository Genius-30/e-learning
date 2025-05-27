import dbConnect from "@/lib/dbConnect";
import Review from "@/models/review.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    // Extract Course ID
    const { courseId } = await params;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return ErrorResponse("Course ID is required", 400);
    }

    // Fetch Reviews
    const reviewsList = await Review.find({ courseId })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();

    const totalReviews = reviewsList.length;
    const averageReview =
      totalReviews > 0
        ? (
            reviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews
          ).toFixed(1)
        : "0";

    return SuccessResponse("Reviews fetched successfully!", {
      reviewsList,
      totalReviews,
      averageReview,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return ErrorResponse(error.message, 500);
  }
}
