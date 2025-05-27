import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import os from "os";
import path from "path";

// 🔹 Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 🔹 Upload file to Cloudinary
export async function uploadFileToCloudinary(file, folder) {
  let tempPath;
  try {
    if (!file) throw new Error("No file provided for upload!");

    // 🔹 Create a temporary file path in the OS temp directory
    const tempDir = os.tmpdir(); // ✅ Cross-platform temp directory
    const safeFileName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_"); // Replace invalid characters
    tempPath = path.join(tempDir, safeFileName);

    // 🔹 Write file to temp path
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(tempPath, buffer);

    // ✅ Ensure file exists
    if (!fs.existsSync(tempPath)) {
      throw new Error(`Temp file not found: ${tempPath}`);
    }

    // 🔹 Validate file format
    const fileExtension = file.name.split(".").pop().toLowerCase();

    // 🔹 Set Cloudinary resource type dynamically
    let resourceType = "auto"; // Default: Let Cloudinary decide
    if (["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(fileExtension)) {
      resourceType = "image";
    } else if (
      ["mp4", "avi", "mov", "wmv", "mkv", "webm"].includes(fileExtension)
    ) {
      resourceType = "video";
    } else if (["pdf", "zip", "txt", "doc", "xlsx"].includes(fileExtension)) {
      resourceType = "raw"; // Other file types go under "raw"
    }

    // 🔹 Use chunked upload for large files (100MB+)
    const fileSizeMB = buffer.length / (1024 * 1024);
    const useChunkedUpload = fileSizeMB > 100; // Enable chunking if file > 100MB

    // 🔹 Upload file to Cloudinary
    const result = useChunkedUpload
      ? await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_large(
            tempPath,
            {
              folder: `CyberGrow Storage/${folder}`,
              resource_type: resourceType,
              chunk_size: 20 * 1024 * 1024, // **Set chunk size to 20MB
              use_filename: true,
              unique_filename: false,
              type: "authenticated",
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
        })
      : await cloudinary.uploader.upload(tempPath, {
          folder: `CyberGrow Storage/${folder}`,
          resource_type: resourceType,
          use_filename: true,
          unique_filename: false,
        });

    // 🔹 Return full response
    return result;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw new Error("File upload failed!");
  } finally {
    // 🔹 Clean up temporary file
    if (tempPath && fs.existsSync(tempPath)) {
      try {
        fs.unlinkSync(tempPath);
        console.log(`✅ Temp file deleted: ${tempPath}`);
      } catch (unlinkError) {
        console.error(`❌ Error deleting temp file: ${tempPath}`, unlinkError);
      }
    }
  }
}

// 🔹 Delete file from Cloudinary
export async function deleteFromCloudinary(
  identifier,
  resourceType = "auto",
  isPublicId = false
) {
  if (!identifier) return;

  try {
    let publicId;

    if (isPublicId) {
      publicId = identifier;
    } else {
      // Extract Public ID from URL
      const parts = identifier.split("/");
      const filename = parts.pop().split(".")[0];
      publicId = `${parts.slice(-2).join("/")}/${filename}`;
    }

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log(`✅ Deleted from Cloudinary: ${publicId}`);
  } catch (error) {
    console.error(`❌ Failed to delete from Cloudinary: ${fileUrl}`, error);
  }
}

// 🔹 Generate Cloudinary signed URL
export async function generateSignature(folder) {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // 🔹 Define options for signed upload
    const options = {
      folder: `CyberGrow Storage/${folder}`,
      timestamp,
      type: "authenticated",
    };

    // 🔹 Generate signed URL
    const signature = cloudinary.utils.api_sign_request(
      options,
      process.env.CLOUDINARY_API_SECRET
    );

    return { signature, timestamp };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw new Error("Failed to generate signed URL!");
  }
}

// 🔹 Generate secure video URL
export function generateSecureVideoUrl(publicId) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 5; // valid for 5 min

  const transformationOptions = {
    resource_type: "video",
    secure: true,
    type: "authenticated",
    sign_url: true,
    expires_at: expiresAt,
  };

  try {
    const signedUrl = cloudinary.url(publicId, transformationOptions);

    return signedUrl;
  } catch (error) {
    console.error("Error generating secure video URL:", error);
    return null;
  }
}
