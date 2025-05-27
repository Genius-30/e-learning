import dbConnect from "@/lib/dbConnect";
import { verifyJWT } from "@/middleware/verifyJWT";
import Section from "@/models/section.model";
import { generateSecureVideoUrl } from "@/utils/cloudinary";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import mongoose from "mongoose";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    // Extract Course ID
    const { courseId } = await params;
    if (!courseId || !mongoose.Types.ObjectId.isValid(courseId)) {
      return ErrorResponse("Course ID is required", 400);
    }

    // Verify JWT
    const user = await verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized", 401);

    // Initialize counters for total lectures
    let totalLectures = 0;

    // Fetch Sections and Lectures
    const sections = await Section.find({ courseId, isDeleted: false })
      .populate({
        path: "lectures",
        select:
          "title description videoUrl isFreePreview duration createdAt publicId",
        options: { sort: { index: 1 } }, // Sort lectures in correct order
      })
      .sort({ index: 1 }) // Sort sections in correct order
      .lean();

    sections.forEach((section) => {
      section.lectures.forEach((lecture) => {
        // Generate videoUrl for unlocked lectures or free previews
        const videoUrl = lecture.isFreePreview
          ? generateSecureVideoUrl(lecture.publicId)
          : null;

        // Set videoUrl if it is a free preview
        lecture.videoUrl = videoUrl;

        // Increment totalLectures for each lecture processed
        totalLectures++;
      });
    });

    // Filter out only the free preview lectures
    const previewLectures = sections.flatMap((section) =>
      section.lectures.filter((lecture) => lecture.isFreePreview)
    );

    return SuccessResponse("Sections and lectures fetched successfully!", {
      previewLectures,
      sections,
      totalSections: sections.length,
      totalLectures,
    });
  } catch (error) {
    console.error("Error fetching sections and lectures:", error);
    return ErrorResponse(error.message, 500);
  }
}
