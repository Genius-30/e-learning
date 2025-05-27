import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Section from "@/models/section.model";
import { generateSecureVideoUrl } from "@/utils/cloudinary";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function GET(req, { params }) {
  try {
    await dbConnect();

    // 🔐 Verify Admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // Get courseId
    const { courseId } = await params;
    if (!courseId) return ErrorResponse("Course ID is required", 400);

    // Find all sections for the course (sorted by index)
    const sections = await Section.find({ courseId, isDeleted: false })
      .sort("index")
      .populate({
        path: "lectures",
        select:
          "title description videoUrl isFreePreview publicId duration createdAt",
        options: { sort: { index: 1 } }, // Sort lectures inside each section
      })
      .lean();

    // ⚡ Inject videoUrl dynamically into each lecture
    const updatedSections = sections.map((section) => ({
      ...section,
      lectures: section.lectures.map((lecture) => {
        const { publicId, ...rest } = lecture;
        return {
          ...rest,
          videoUrl: generateSecureVideoUrl(publicId),
        };
      }),
    }));

    return SuccessResponse("Sections fetched successfully!", {
      sections: updatedSections,
    });
  } catch (error) {
    console.error("Error fetching sections:", error);
    return ErrorResponse("Failed to fetch sections", 500);
  }
}
