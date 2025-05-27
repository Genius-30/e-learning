import dbConnect from "@/lib/dbConnect";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import User from "@/models/user.model";
import { verifyAdmin } from "@/middleware/verifyAdmin";

export async function GET(req) {
  try {
    await dbConnect();

    // Verify Admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // Extract query params
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const search = url.searchParams.get("search") || "";
    const statusFilters = url.searchParams.getAll("status"); // "active" | "inactive" | "all"

    console.log(statusFilters);

    // Build match filter
    const matchFilter = {};

    // Add search filter if provided
    if (search) {
      matchFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Add Active Status filter based on status query
    if (statusFilters.length === 1) {
      matchFilter.isActive = statusFilters[0] === "active";
    }

    // Aggregation Pipeline
    const users = await User.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: "courses",
          localField: "enrolledCourses",
          foreignField: "_id",
          as: "enrolledCoursesInfo",
        },
      },
      {
        $project: {
          name: 1,
          email: 1,
          isActive: 1,
          createdAt: 1,
          enrolledCourses: "$enrolledCoursesInfo.title",
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    // Total Count for Pagination
    const totalUsers = await User.countDocuments(matchFilter);

    return SuccessResponse("Users fetched successfully!", {
      users,
      pagination: {
        totalUsers,
        page,
        totalPages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return ErrorResponse(error.message || "Internal Server Error", 500);
  }
}
