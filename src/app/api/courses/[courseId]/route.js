import dbConnect from "@/lib/dbConnect";
import Course from "@/models/course.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import { verifyJWT } from "@/middleware/verifyJWT";
import mongoose from "mongoose";
import "@/models/section.model";
import Enrollment from "@/models/enrollment.model";
import { getDiscountedPrice } from "@/lib/getDiscountedPrice";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    // Extract Course ID
    const { courseId } = await params;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return ErrorResponse("Course ID is required", 400);
    }

    // Find Course
    const course = await Course.findById(courseId);
    if (!course) {
      return ErrorResponse("Course not found", 404);
    }

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

    // Check if user has purchased the course
    const user = await verifyJWT(req);
    const purchased = user
      ? await Enrollment.findOne({ userId: user.id, courseId })
      : null;

    return SuccessResponse("Course details fetched successfully!", {
      _id: course._id,
      title: course.title,
      description: course.description,
      thumbnail: course.thumbnail,
      category: course.category,
      createdAt: course.createdAt,
      updatedAt: course.updatedAt || course.createdAt,

      // Pricing & Purchases
      price: {
        online: onlinePrice,
        hybrid: hybridPrice,
      },
      purchases: {
        hybrid: course.purchaseStats?.hybrid || 0,
        online: course.purchaseStats?.online || 0,
      },

      // User's course purchase status
      purchased: Boolean(purchased),
      totalWeeks: course.durationWeeks,
      totalHours: course.totalHours,
    });
  } catch (error) {
    console.error("Error fetching course details:", error);
    return ErrorResponse(error.message, 500);
  }
}
