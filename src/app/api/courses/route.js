import dbConnect from "@/lib/dbConnect";
import { getDiscountedPrice } from "@/lib/getDiscountedPrice";
import Course from "@/models/course.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function GET(req) {
  try {
    await dbConnect();

    // 🔹 Extract Query Parameters
    const url = new URL(req.url);
    const search = url.searchParams.get("search")?.trim() || "";
    const category = url.searchParams.get("category")?.trim();
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 9;
    const sortBy = url.searchParams.get("sortBy") || "newest";

    // 🔹 Build Query Object
    const query = { status: "published" };

    if (search) {
      query.title = { $regex: search, $options: "i" }; // Case-insensitive search
    }

    if (category) {
      query.category = category;
    }

    let sortQuery = {};
    switch (sortBy) {
      case "popularity":
        sortQuery = { totalPurchases: -1 };
        break;
      case "rating":
        sortQuery = { averageRating: -1 };
        break;
      case "oldest":
        sortQuery = { createdAt: 1 };
        break;
      default:
        sortQuery = { createdAt: -1 };
    }

    // Fetch courses with aggregation pipeline
    const courses = await Course.aggregate([
      { $match: query },
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
          totalPurchases: {
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
          "purchaseOptions.online": 1,
          "purchaseOptions.hybrid": 1,
          reviewCount: 1,
          averageRating: 1,
          totalPurchases: 1,
        },
      },
      { $sort: sortQuery },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    // Calculate final prices after aggregation
    const enrichedCourses = await Promise.all(
      courses.map(async (course) => ({
        ...course,
        purchaseOptions: {
          online: {
            ...course.purchaseOptions.online,
            finalPrice: await getDiscountedPrice(course._id, "online"),
          },
          hybrid: {
            ...course.purchaseOptions.hybrid,
            finalPrice: await getDiscountedPrice(course._id, "hybrid"),
          },
        },
      }))
    );

    // 🔹 Get Total Count for Pagination
    const totalCourses = await Course.countDocuments(query);

    return SuccessResponse("Courses fetched successfully!", {
      courses: enrichedCourses,
      pagination: {
        totalCourses,
        totalPages: Math.ceil(totalCourses / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return ErrorResponse(error.message, 500);
  }
}
