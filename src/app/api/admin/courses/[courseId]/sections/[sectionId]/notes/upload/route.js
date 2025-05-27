import dbConnect from "@/lib/dbConnect";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import Section from "@/models/section.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import { uploadFileToCloudinary } from "@/utils/cloudinary";

export async function POST(req, { params }) {
  try {
    await dbConnect();

    // 🔹 Verify Admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    // 🔹 Extract Section ID from Params
    const { sectionId } = await params;
    if (!sectionId) return ErrorResponse("Section ID is required", 400);

    // 🔹 Find the Section
    const section = await Section.findById(sectionId);
    if (!section) return ErrorResponse("Section not found", 404);

    // 🔹 Parse Request Body
    const formData = await req.formData();
    const note = formData.get("note");

    if (!note) return ErrorResponse("File is required", 400);

    // 🔹 Upload File to Cloudinary
    const uploadResponse = await uploadFileToCloudinary(note, "notes");
    if (!uploadResponse?.secure_url) {
      return ErrorResponse("Failed to upload file", 500);
    }

    // ✅ Title is now just the original file name
    const title = note.name || "Untitled Note";

    const supportedTypes = {
      "application/pdf": "pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        "docx",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation":
        "pptx",
      "image/png": "image",
      "image/jpeg": "image",
      "image/webp": "image",
      "image/gif": "image",
    };

    let fileType = supportedTypes[note.type];

    // ❗Fallback to extension check if MIME type not matched
    if (!fileType) {
      const ext = note.name.split(".").pop()?.toLowerCase();
      const extMap = {
        pdf: "pdf",
        docx: "docx",
        pptx: "pptx",
        png: "image",
        jpg: "image",
        jpeg: "image",
        webp: "image",
        gif: "image",
      };
      fileType = extMap[ext];
    }

    if (!fileType) return ErrorResponse("Unsupported file type", 400);

    // 🔹 Add Note to Section's Notes URLs
    const newNote = {
      url: uploadResponse.secure_url,
      title,
      fileType,
      uploadedAt: new Date(),
    };

    // 🔹 Add Note to Section
    section.notesUrls.push(newNote);
    await section.save();

    return SuccessResponse("Note uploaded successfully!", {
      note: {
        url: uploadResponse.secure_url,
        title,
        fileType,
      },
    });
  } catch (error) {
    console.error(error);
    return ErrorResponse(error.message, 500);
  }
}
