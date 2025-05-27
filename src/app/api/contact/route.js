import sendEmail from "@/lib/sendEmail";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";

const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL;

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return ErrorResponse("All fields are required", 400);
    }

    const emailResponse = await sendEmail({
      email: receiverEmail,
      subject: "New Contact Form Submission",
      templateName: "CONTACT_FORM",
      placeholders: {
        name,
        email,
        message,
      },
    });

    if (!emailResponse.success) {
      return ErrorResponse(emailResponse.error || "Failed to send email", 500);
    }

    return SuccessResponse("Email sent successfully");
  } catch (error) {
    console.error("Contact form error:", error);
    return ErrorResponse(
      "An error occurred while processing your request",
      500
    );
  }
}
