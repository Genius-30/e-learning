import dbConnect from "@/lib/dbConnect";
import Review from "@/models/review.model";
import Course from "@/models/course.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import Enrollment from "@/models/enrollment.model";
import { verifyJWT } from "@/middleware/verifyJWT";
import { Filter } from "bad-words";
import mongoose from "mongoose";

export async function POST(req, { params }) {
  try {
    await dbConnect();
    const { courseId } = await params;

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return ErrorResponse("Invalid course ID", 400);
    }

    const { rating, comment } = await req.json();

    const user = await verifyJWT(req);
    if (!user) ErrorResponse("Unauthorized", 401);

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return ErrorResponse("Rating must be between 1 and 5", 400);
    }

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ErrorResponse("Course not found", 404);
    }

    // Check if the user has enrolled in the course
    const enrollment = await Enrollment.findOne({
      userId: user.id,
      courseId,
    });

    if (!enrollment) {
      return ErrorResponse(
        "You must be enrolled in this course to review it",
        403
      );
    }

    // Check if the user has already submitted a review
    const existingReview = await Review.findOne({
      userId: user.id,
      courseId: courseId,
    });
    if (existingReview) {
      return ErrorResponse("You have already reviewed this course", 400);
    }

    // Censor bad words in the comment
    const filter = new Filter();
    const sanitizedComment = filter.clean(comment || "");

    // Create and save review
    const review = await Review.create({
      userId: user.id,
      courseId,
      rating,
      comment: sanitizedComment,
    });

    return SuccessResponse("Review submitted successfully", review);
  } catch (error) {
    console.log("Error in submitReview API:", error);
    return ErrorResponse("Internal server error", 500);
  }
}

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const { courseId } = await params;

    const user = await verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized", 401);

    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return ErrorResponse("Invalid course ID", 400);
    }

    // Check if the course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return ErrorResponse("Course not found", 404);
    }

    // Fetch all reviews for the course, populating user details
    const allReviews = await Review.find({ courseId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    const totalReviews = allReviews.length;

    let averageRating = 0;
    if (totalReviews > 0) {
      const totalRating = allReviews.reduce(
        (sum, review) => sum + (review.rating || 0),
        0
      );
      const rawAverage = totalRating / totalReviews;

      // Round to nearest 0.5 step
      averageRating = Math.round(rawAverage * 2) / 2;
    }

    // Reorder: put current user's review at top
    const userReview = allReviews.find(
      (review) => review.userId._id.toString() === user.id
    );
    const otherReviews = allReviews.filter(
      (review) => review.userId._id.toString() !== user.id
    );

    const reviews = userReview ? [userReview, ...otherReviews] : otherReviews;

    return SuccessResponse("Course reviews fetched successfully", {
      reviews,
      totalReviews,
      averageRating,
    });
  } catch (error) {
    console.log("Error in fetchCourseReviews API:", error);
    return ErrorResponse("Internal server error", 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const { courseId, reviewId } = await params;

    const user = await verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized", 401);

    // Find the review
    const review = await Review.findOne({ _id: reviewId, courseId });
    if (!review) return ErrorResponse("Review not found", 404);

    // Check if the user is the review author or an admin
    if (review.userId.toString() !== user.id) {
      return ErrorResponse("You are not authorized to delete this review", 403);
    }

    // Delete the review
    await Review.findByIdAndDelete(reviewId);

    return SuccessResponse("Review deleted successfully");
  } catch (error) {
    console.log("Error in deleteReview API:", error);
    return ErrorResponse("Internal server error", 500);
  }
}
