import crypto from "crypto";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/course.model";
import User from "@/models/user.model";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import Payment from "@/models/payment.model";
import Enrollment from "@/models/enrollment.model";
import { getDiscountedPrice } from "@/lib/getDiscountedPrice";
import sendEmail from "@/lib/sendEmail";

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const razorpaySignature = req.headers.get("x-razorpay-signature");

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (razorpaySignature !== expectedSignature) {
      return ErrorResponse("Invalid signature", 400);
    }

    const body = JSON.parse(rawBody);
    const event = body.event;
    const entity = body.payload?.payment?.entity;

    if (!entity) return ErrorResponse("Invalid payload", 400);

    await dbConnect();

    const {
      id: razorpay_payment_id,
      order_id: razorpay_order_id,
      notes,
      status,
      error_description,
    } = entity;

    const courseId = notes.courseId;
    const userId = notes.userId;
    const purchaseType = notes.purchaseType;
    const paymentGateway = "razorpay";

    if (!courseId || !userId || !purchaseType) {
      return ErrorResponse("Missing required fields", 400);
    }

    const course = await Course.findById(courseId);
    const user = await User.findById(userId);
    if (!course || !user) {
      return ErrorResponse("Invalid course or user", 404);
    }

    const existingPayment = await Payment.findOne({
      paymentId: razorpay_payment_id,
    });
    if (existingPayment) {
      return ErrorResponse("Payment already processed", 409);
    }

    const amountPaid = await getDiscountedPrice(course._id, purchaseType);

    if (event === "payment.captured" && status === "captured") {
      const alreadyEnrolled = await Enrollment.findOne({ userId, courseId });
      if (alreadyEnrolled || user.enrolledCourses.includes(courseId)) {
        return ErrorResponse("Already enrolled", 409);
      }

      // Save successful payment
      const payment = await Payment.create({
        userId,
        courseId,
        purchaseType,
        amountPaid,
        paymentStatus: "success",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        gatewaySignature: razorpaySignature,
        paymentGateway,
      });

      // Enroll user
      await Enrollment.create({
        userId,
        courseId,
        paymentId: payment._id,
      });

      user.enrolledCourses.push(course._id);
      await user.save();

      await sendEmail({
        email: user.email,
        subject: `Welcome to the ${course.title} Course!`,
        templateName: "CoursePurchased",
        placeholders: {
          name: user.name,
          courseName: course.title,
          courseLink: `${process.env.CLIENT_URL}/courses/${course._id}/learn`,
        },
      });

      return SuccessResponse("Payment verified and enrolled successfully", {
        paymentId: payment._id,
        enrollment: {
          courseId: course._id,
          purchaseType,
        },
      });
    }

    // Handle payment failures
    if (event === "payment.failed") {
      await Payment.create({
        userId,
        courseId,
        purchaseType,
        amountPaid,
        paymentStatus: "failed",
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        gatewaySignature: razorpaySignature,
        paymentGateway,
        failureReason: error_description || "Unknown reason",
      });

      await sendEmail({
        email: user.email,
        subject: `Payment Failed for ${course.title}`,
        templateName: "PaymentFailed",
        placeholders: {
          name: user.name,
          courseName: course.title,
          failureReason: error_description || "Unknown reason",
          courseLink: `${process.env.CLIENT_URL}/courses/${course._id}`,
        },
      });

      return SuccessResponse("Failed payment recorded", { status: "failed" });
    }

    return SuccessResponse("Webhook received but no action taken");
  } catch (err) {
    console.error("Webhook Error:", err);
    return ErrorResponse("Webhook failed", 500);
  }
}
