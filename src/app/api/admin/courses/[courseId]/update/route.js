import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Course from "@/models/course.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import {
  uploadFileToCloudinary,
  deleteFromCloudinary,
} from "@/utils/cloudinary";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    const { courseId } = await params;
    if (!courseId) return ErrorResponse("Course ID is required", 400);

    const formData = await req.formData();

    const course = await Course.findById(courseId);
    if (!course) return ErrorResponse("Course not found", 404);

    await updateCourseFields(course, formData);

    await course.save();
    return SuccessResponse("Course updated successfully!", course.toObject());
  } catch (error) {
    console.error("Error updating course:", error);
    return ErrorResponse(error.message, 500);
  }
}

async function updateCourseFields(course, formData) {
  const rawFields = {
    title: formData.get("title")?.trim(),
    description: formData.get("description")?.trim(),
    category: formData.get("category")?.trim(),
    durationWeeks: formData.get("durationWeeks"),
  };

  if (rawFields.title) course.title = rawFields.title;
  if (rawFields.description) course.description = rawFields.description;
  if (rawFields.category) course.category = rawFields.category;

  if (
    rawFields.durationWeeks !== null &&
    rawFields.durationWeeks !== undefined
  ) {
    const weeks = parseInt(rawFields.durationWeeks, 10);
    if (isNaN(weeks) || weeks < 1) {
      throw new Error("Duration must be at least 1 week");
    }
    course.durationWeeks = weeks;
  }

  await handleThumbnailUpdate(course, formData.get("thumbnail"));
  updatePurchaseOptions(course, formData);
}

async function handleThumbnailUpdate(course, newThumbnail) {
  if (!newThumbnail) return;

  if (course.thumbnail) {
    await deleteFromCloudinary(course.thumbnail, "image");
  }

  const uploadResult = await uploadFileToCloudinary(newThumbnail, "thumbnails");

  if (!uploadResult?.secure_url) {
    throw new Error("Failed to upload new thumbnail");
  }

  course.thumbnail = uploadResult.secure_url;
}

function updatePurchaseOptions(course, formData) {
  const types = ["online", "hybrid"];

  for (const type of types) {
    const priceKey = `${type}Price`;
    const discountPercentKey = `${type}DiscountPercentage`;
    const discountUntilKey = `${type}DiscountValidUntil`;

    // If none of the fields for this type are in formData, skip

    const hasRelevantField =
      formData.has(priceKey) ||
      formData.has(discountPercentKey) ||
      formData.has(discountUntilKey);

    if (!hasRelevantField) continue;

    const existing = course.purchaseOptions[type] || {};

    // Update only provided fields
    if (formData.has(priceKey)) {
      const price = parseFloat(formData.get(priceKey));
      if (!isNaN(price)) {
        existing.price = price;
      }
    }

    if (formData.has(discountPercentKey)) {
      const percent = parseFloat(formData.get(discountPercentKey)) || 0;
      if (percent < 0 || percent > 100) {
        throw new Error("Discount % must be between 0 and 100");
      }

      existing.discount = existing.discount || {};
      existing.discount.percentage = percent;
    }

    if (formData.has(discountUntilKey)) {
      const untilRaw = formData.get(discountUntilKey);
      if (untilRaw) {
        const validUntil = new Date(untilRaw);
        if (isNaN(validUntil.getTime())) {
          throw new Error("Invalid discount valid until date");
        }
        existing.discount = existing.discount || {};
        existing.discount.validUntil = validUntil;
      } else {
        existing.discount = existing.discount || {};
        existing.discount.validUntil = null;
      }
    }

    course.purchaseOptions[type] = existing;
  }
}
