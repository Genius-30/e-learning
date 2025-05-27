import dbConnect from "@/lib/dbConnect";
import { getDiscountedPrice } from "@/lib/getDiscountedPrice";
import { verifyJWT } from "@/middleware/verifyJWT";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function GET(req) {
  try {
    await dbConnect();

    let user = null;
    try {
      user = await verifyJWT(req); // Attempt to verify user
      if (user) {
        user = await User.findById(user.id).populate("enrolledCourses");
      }
    } catch (error) {
      console.warn("Guest user, showing trending recommendations.");
    }

    let recommendedCourses = [];

    // 🔹 If user is authenticated, fetch personalized recommendations
    if (user && user.enrolledCourses.length > 0) {
      // Extract enrolled course categories
      const enrolledCategories = user.enrolledCourses.map(
        (course) => course.category
      );

      // Recommend courses from the same categories
      recommendedCourses = await Course.aggregate([
        {
          $match: {
            status: "published",
            category: { $in: enrolledCategories },
            _id: { $nin: user.enrolledCourses.map((c) => c._id) }, // Exclude enrolled courses
          },
        },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "courseId",
            as: "reviews",
          },
        },
        {
          $addFields: {
            reviewCount: { $size: "$reviews" },
            averageRating: { $avg: "$reviews.rating" },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            thumbnail: 1,
            category: 1,
            durationWeeks: 1,
            totalHours: 1,
            purchaseStats: 1,
            "purchaseOptions.online.price": 1,
            "purchaseOptions.online.discount": 1,
            "purchaseOptions.hybrid.price": 1,
            "purchaseOptions.hybrid.discount": 1,
            reviewCount: 1,
            averageRating: 1,
          },
        },
        { $sort: { createdAt: -1 } }, // Sort by newest
        { $limit: 6 },
      ]);
    }

    // Fallback: Trending courses for guests or empty personalized results
    if (recommendedCourses.length === 0) {
      recommendedCourses = await Course.aggregate([
        { $match: { status: "published" } },
        {
          $lookup: {
            from: "reviews",
            localField: "_id",
            foreignField: "courseId",
            as: "reviews",
          },
        },
        {
          $addFields: {
            reviewCount: { $size: "$reviews" },
            averageRating: { $avg: "$reviews.rating" },
            totalEnrolled: {
              $add: ["$purchaseStats.online", "$purchaseStats.hybrid"],
            },
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            thumbnail: 1,
            category: 1,
            durationWeeks: 1,
            totalHours: 1,
            purchaseStats: 1,
            "purchaseOptions.online.price": 1,
            "purchaseOptions.online.discount": 1,
            "purchaseOptions.hybrid.price": 1,
            "purchaseOptions.hybrid.discount": 1,
            reviewCount: 1,
            averageRating: 1,
            totalEnrolled: 1,
          },
        },
        { $sort: { totalEnrolled: -1 } }, // Sort by most enrolled
        { $limit: 6 },
      ]);
    }

    // Add final prices to the purchaseOptions for each course
    const enrichedCourses = await Promise.all(
      recommendedCourses.map(async (course) => {
        return {
          ...course,
          purchaseOptions: {
            online: {
              price: course.purchaseOptions.online.price,
              discount: course.purchaseOptions.online.discount,
              finalPrice: await getDiscountedPrice(course._id, "online"),
            },
            hybrid: {
              price: course.purchaseOptions.hybrid.price,
              discount: course.purchaseOptions.hybrid.discount,
              finalPrice: await getDiscountedPrice(course._id, "hybrid"),
            },
          },
        };
      })
    );

    return SuccessResponse("Recommended courses fetched!", {
      courses: enrichedCourses,
    });
  } catch (error) {
    console.error("Error fetching recommended courses:", error);
    return ErrorResponse(error.message, 500);
  }
}
