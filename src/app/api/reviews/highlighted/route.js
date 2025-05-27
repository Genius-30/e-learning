import dbConnect from "@/lib/dbConnect";
import Review from "@/models/review.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function GET() {
  try {
    await dbConnect();

    // 🔹 Fetch random 5 reviews
    const reviews = await Review.aggregate([
      { $sort: { rating: -1, createdAt: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $project: {
          comment: 1,
          rating: 1,
          courseId: 1,
          createdAt: 1,
          updatedAt: 1,
          name: "$user.name",
        },
      },
      { $limit: 5 },
    ]);

    // 🔹 Enhance each review with a generated avatar URL
    reviews.forEach((review) => {
      review.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
        review.name || "Anonymous"
      )}&background=random&color=fff&size=200`;
    });

    return SuccessResponse("Highlighted reviews fetched successfully!", {
      reviews,
    });
  } catch (error) {
    console.error("Error fetching highlighted reviews:", error);
    return ErrorResponse(error.message, 500);
  }
}
