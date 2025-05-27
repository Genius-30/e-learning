import dbConnect from "@/lib/dbConnect";
import { getDiscountedPrice } from "@/lib/getDiscountedPrice";
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

    const onlineOption = course.purchaseOptions?.online;
    const hybridOption = course.purchaseOptions?.hybrid;

    const onlinePrice = {
      original: onlineOption?.price || 0,
      discountPercentage:
        onlineOption?.discount?.validUntil &&
        new Date(onlineOption.discount.validUntil) > new Date()
          ? onlineOption.discount.percentage
          : 0,
      validUntil:
        onlineOption?.discount?.validUntil &&
        new Date(onlineOption.discount.validUntil) > new Date()
          ? onlineOption.discount.validUntil
          : null,
      finalPrice: await getDiscountedPrice(course._id, "online"),
    };

    const hybridPrice = {
      original: hybridOption?.price || 0,
      discountPercentage:
        hybridOption?.discount?.validUntil &&
        new Date(hybridOption.discount.validUntil) > new Date()
          ? hybridOption.discount.percentage
          : 0,
      validUntil:
        hybridOption?.discount?.validUntil &&
        new Date(hybridOption.discount.validUntil) > new Date()
          ? hybridOption.discount.validUntil
          : null,
      finalPrice: await getDiscountedPrice(course._id, "hybrid"),
    };

    // Count sections
    const totalSections = course.sections?.length || 0;

    // Count lectures by looping through section arrays
    const totalLectures =
      course.sections?.reduce((acc, section) => {
        return acc + (section.lectures?.length || 0);
      }, 0) || 0;

    return SuccessResponse("Course overview fetched successfully!", {
      _id: course._id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      category: course.category,
      durationWeeks: course.durationWeeks,
      totalHours: course.totalHours || 0,
      status: course.status || "draft",

      purchaseOptions: {
        online: onlinePrice,
        hybrid: hybridPrice,
      },

      totalSections,
      totalLectures,
    });
  } catch (error) {
    console.error("Error fetching course overview:", error);
    return ErrorResponse(error.message, 500);
  }
}
