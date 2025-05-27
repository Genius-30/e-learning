import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Lecture from "@/models/lecture.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

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
    console.log(lecture);

    if (!lecture) return ErrorResponse("Lecture not found", 404);

    lecture.isFreePreview = !lecture.isFreePreview; // Toggle the isFreePreview field
    await lecture.save();

    return SuccessResponse("Lecture updated successfully!", {
      lecture,
    });
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
}
