import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Section from "@/models/section.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import { deleteFromCloudinary } from "@/utils/cloudinary";

export async function POST(req, { params }) {
  try {
    await dbConnect();

    // 🔹 Verify Admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // 🔹 Extract Section ID and Note URL from Request
    const { sectionId } = await params;
    if (!sectionId) return ErrorResponse("Section ID is required", 400);

    const { url } = await req.json();
    if (!url) return ErrorResponse("Note URL is required", 400);

    // 🔹 Find the Section
    const section = await Section.findById(sectionId);
    if (!section) return ErrorResponse("Section not found", 404);

    // 🔹 Check if Note Exists
    const noteIndex = section.notesUrls.findIndex((note) => note.url === url);
    if (noteIndex === -1) {
      return ErrorResponse("Note not found in this section", 404);
    }

    // 🔹 Delete File from Cloudinary
    await deleteFromCloudinary(url, "raw");

    // 🔹 Remove Note from `notesUrls` Array
    section.notesUrls.splice(noteIndex, 1);
    await section.save();

    return SuccessResponse("Note deleted successfully!", section.notesUrls);
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
}
