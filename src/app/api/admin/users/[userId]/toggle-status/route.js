import dbConnect from "@/lib/dbConnect";
import sendEmail from "@/lib/sendEmail";
import { verifyAdmin } from "@/middleware/verifyAdmin";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

export async function PATCH(req, { params }) {
  try {
    await dbConnect();

    // Verify admin
    const admin = await verifyAdmin(req);
    if (!admin) return ErrorResponse("Unauthorized access", 403);

    const { userId } = await params;

    if (!userId) {
      return ErrorResponse("UserId is missing!", 400);
    }

    // Find the user by ID and update the status
    const user = await User.findById(userId);
    if (!user) {
      return ErrorResponse("User not found", 404);
    }

    // Toggle isActive status
    user.isActive = !user.isActive;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: `Your account has been ${
        user.isActive ? "activated" : "deactivated"
      }`,
      templateName: "UserStatusUpdate",
      placeholders: {
        name: user.name,
        email: user.email,
        actionTitle: `Account ${user.isActive ? "Reactivated" : "Deactivated"}`,
        statusContent: user.isActive
          ? `<p>Your account has been <b>reactivated</b> by the admin. You can now log in using your existing credentials.</p>
         <div class="details">
           <p><b>Email:</b> <span class="highlight">${user.email}</span></p>
         </div>`
          : `<p>Your account has been <b>deactivated</b> by the admin. You can no longer access your account.</p>`,
      },
    });

    return SuccessResponse(
      `User has been ${
        user.isActive ? "activated" : "deactivated"
      } successfully`,
      { userId: user._id, newStatus: user.isActive }
    );
  } catch (error) {
    console.error("Error updating user status:", error);
    return ErrorResponse(error.message || "Internal Server Error", 500);
  }
}
