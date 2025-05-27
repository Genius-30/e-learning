import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Section from "@/models/section.model";
import Lecture from "@/models/lecture.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import {
  deleteFromCloudinary,
  generateSecureVideoUrl,
  uploadFileToCloudinary,
} from "@/utils/cloudinary";

export async function DELETE(req, { params }) {
  try {
    await dbConnect();

    // 🔹 Verify Admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // 🔹 Extract IDs from Params
    const { courseId, sectionId, lectureId } = await params;
    if (!courseId || !sectionId || !lectureId) {
      return ErrorResponse("Missing required parameters", 400);
    }

    // 🔹 Find the Lecture
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return ErrorResponse("Lecture not found", 404);

    // Check if lecture actually belongs to this section
    if (lecture.sectionId.toString() !== sectionId) {
      return ErrorResponse("Lecture does not belong to this section", 400);
    }

    // Delete video from Cloudinary
    await deleteFromCloudinary(lecture.publicId, "video", true);

    // Delete Lecture
    const deletedIndex = lecture.index;
    await lecture.deleteOne();

    // Remove from section.lectures array
    await Section.findByIdAndUpdate(sectionId, {
      $pull: { lectures: lectureId },
    });

    // 🔹 Shift the `index` of remaining lectures
    await Lecture.updateMany(
      { sectionId, index: { $gt: deletedIndex } },
      { $inc: { index: -1 } } // Decrease index by 1
    );

    return SuccessResponse("Lecture deleted successfully!");
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
}

// 🔹 Update Lecture
export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    // 🔹 Verify Admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // 🔹 Extract IDs from Params
    const { sectionId, lectureId } = await params;
    if (!sectionId || !lectureId)
      return ErrorResponse("Section ID and Lecture ID are required", 400);

    // 🔹 Find the Lecture
    const lecture = await Lecture.findById(lectureId);
    if (!lecture) return ErrorResponse("Lecture not found", 404);

    // 📄 Parse Data (title, description, video)
    const { title, description, videoMetaData } = await req.json();

    let updatedFields = {};

    // 🔹 Update Title if provided
    if (title) updatedFields.title = title;
    if (description) updatedFields.description = description;

    // 🔹 Update Video if new videoMetaData is provided
    if (videoMetaData) {
      // Delete old video if exists
      if (lecture.publicId) {
        await deleteFromCloudinary(lecture.publicId, "video", true);
      }

      // Assume videoMetaData contains { secure_url, duration, public_id }
      updatedFields.duration = videoMetaData.duration;
      updatedFields.publicId = videoMetaData.public_id;
    }

    // 🔹 Update the Lecture in Database
    const updatedLecture = await Lecture.findByIdAndUpdate(
      lectureId,
      updatedFields,
      { new: true }
    );

    updatedLecture.videoUrl = generateSecureVideoUrl(updatedLecture.publicId);

    return SuccessResponse("Lecture updated successfully!", {
      lecture: updatedLecture,
    });
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
}
