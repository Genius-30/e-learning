import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Course from "@/models/course.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    const { courseId } = await params;

    if (!courseId) return ErrorResponse("Course ID is required", 400);

    const course = await Course.findById(courseId);
    if (!course) return ErrorResponse("Course not found", 404);

    const getOrEmpty = (value) =>
      value !== undefined && value !== null && value !== 0 ? value : "";

    return SuccessResponse("Course details fetched successfully!", {
      _id: course._id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      category: course.category,
      durationWeeks: course.durationWeeks,
      onlinePrice: course.purchaseOptions?.online?.price,
      onlineDiscountPercentage: getOrEmpty(
        course.purchaseOptions?.online?.discount?.percentage
      ),
      onlineDiscountValidUntil: getOrEmpty(
        course.purchaseOptions?.online?.discount?.validUntil
      ),
      hybridPrice: course.purchaseOptions?.hybrid?.price,
      hybridDiscountPercentage: getOrEmpty(
        course.purchaseOptions?.hybrid?.discount?.percentage
      ),
      hybridDiscountValidUntil: getOrEmpty(
        course.purchaseOptions?.hybrid?.discount?.validUntil
      ),
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    return ErrorResponse(error.message, 500);
  }
}
