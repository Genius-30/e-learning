import { verifyAdmin } from "@/middleware/verifyAdmin";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import Section from "@/models/section.model";
import Lecture from "@/models/lecture.model";
import dbConnect from "@/lib/dbConnect";
import { uploadFileToCloudinary } from "@/utils/cloudinary";

export async function POST(req, { params }) {
  try {
    await dbConnect();

    // Verify if the user is an admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // Parse JSON body instead of form data
    const { title, description = "", videoMetaData } = await req.json();

    // check if title and video are provided
    if (!title || !videoMetaData?.public_id) {
      return ErrorResponse("Title and publicId are required", 400);
    }

    if (!videoMetaData.duration) {
      return ErrorResponse("Video metadata is missing", 400);
    }

    const { courseId, sectionId } = await params;
    if (!sectionId) return ErrorResponse("Section ID is required", 400);
    if (!courseId) return ErrorResponse("Course ID is required", 400);

    // Check if the section exists
    const section = await Section.findById(sectionId);
    if (!section) return ErrorResponse("Section not found", 404);

    // Get Last Lecture's Index (to maintain order)
    const lastLecture = await Lecture.findOne({ sectionId }).sort("-index");
    const index = lastLecture ? lastLecture.index + 1 : 0; // Next available index

    // Create a new lecture
    const newLecture = await Lecture.create({
      sectionId,
      title,
      description,
      duration: videoMetaData.duration,
      publicId: videoMetaData.public_id,
      index,
    });

    // Update section with new lecture
    section.lectures.push(newLecture._id);
    await section.save();

    return SuccessResponse("Lecture uploaded successfully!", {
      lecture: newLecture,
    });
  } catch (error) {
    console.error("Error uploading lecture:", error);
    return ErrorResponse("Internal Server Error", 500);
  }
}
