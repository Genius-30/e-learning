import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Course from "@/models/course.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import Section from "@/models/section.model";
import User from "@/models/user.model";

export async function GET(req) {
  try {
    await dbConnect();

    // 🔹 Verify Admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // 🔹 Extract Query Params0.

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page")) || 1;
    const limit = parseInt(url.searchParams.get("limit")) || 100;
    const search = url.searchParams.get("search") || "";
    const status = url.searchParams.get("status"); // "published" | "draft"
    const sort = url.searchParams.get("sort") || "createdAt";
    const order = url.searchParams.get("order") === "asc" ? 1 : -1;

    //🔹 Build match filter
    const matchFilter = {};
    if (search) matchFilter.title = { $regex: search, $options: "i" };
    if (status === "published") matchFilter.status = "published";
    if (status === "draft") matchFilter.status = "draft";

    // Aggregation pipeline to fetch courses with sections and student count
    const courses = await Course.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: "sections",
          localField: "_id",
          foreignField: "courseId",
          as: "sections",
        },
      },
      {
        $lookup: {
          from: "users",
          let: { courseId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$$courseId", "$enrolledCourses"],
                },
              },
            },
            {
              $count: "totalStudents",
            },
          ],
          as: "studentData",
        },
      },
      {
        $addFields: {
          totalSections: { $size: "$sections" },
          totalLectures: {
            $sum: {
              $map: {
                input: "$sections",
                as: "section",
                in: { $size: "$$section.lectures" },
              },
            },
          },
          totalStudents: {
            $cond: [
              { $gt: [{ $size: "$studentData" }, 0] },
              { $arrayElemAt: ["$studentData.totalStudents", 0] },
              0,
            ],
          },
        },
      },
      {
        $project: {
          sections: 0,
          studentData: 0,
        },
      },
      { $sort: { [sort]: order } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    // 🔹 Count Total Courses (for Pagination Info)
    const totalCourses = await Course.countDocuments(matchFilter);

    return SuccessResponse("Admin courses fetched successfully!", {
      courses,
      pagination: {
        totalCourses,
        page,
        totalPages: Math.ceil(totalCourses / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching admin courses:", error);
    return ErrorResponse(error.message, 500);
  }
}
