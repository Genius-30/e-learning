import Razorpay from "razorpay";
import { ErrorResponse, SuccessResponse } from "@/utils/responseUtils";
import dbConnect from "@/lib/dbConnect";
import Course from "@/models/course.model";
import { verifyJWT } from "@/middleware/verifyJWT";
import { getDiscountedPrice } from "@/lib/getDiscountedPrice";
import User from "@/models/user.model";
import Enrollment from "@/models/enrollment.model";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(req) {
  try {
    await dbConnect();

    // Authenticate
    const user = await verifyJWT(req);
    if (!user) return ErrorResponse("Unauthorized", 403);

    const { courseId, purchaseType } = await req.json();

    if (!courseId || !purchaseType) {
      return ErrorResponse("Course ID and purchase type are required", 400);
    }

    // Validate course and price
    const course = await Course.findById(courseId);
    if (!course) return ErrorResponse("Course not found", 404);

    const userDoc = await User.findById(user.id);

    // 🔁 Check if user is already enrolled (in user model)
    const alreadyEnrolledInUser = userDoc.enrolledCourses.includes(courseId);

    // 🔁 Check if enrollment record exists (in enrollment model)
    const alreadyEnrolledInDb = await Enrollment.findOne({
      userId: user.id,
      courseId: courseId,
    });

    if (alreadyEnrolledInUser || alreadyEnrolledInDb) {
      return ErrorResponse("You are already enrolled in this course", 409);
    }

    const purchaseOption = course.purchaseOptions[purchaseType];
    if (!purchaseOption)
      return ErrorResponse(
        `No ${purchaseType} option available for this course`,
        400
      );

    const amount = await getDiscountedPrice(course._id, purchaseType);

    // 🧾 Create Razorpay order
    const options = {
      amount: amount * 100, // amount in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        courseId,
        userId: user.id,
        purchaseType,
        amount,
      },
    };

    const order = await razorpay.orders.create(options);

    return SuccessResponse("Order created", {
      orderId: order.id,
      amount: order.amount,
    });
  } catch (err) {
    console.error("Razorpay order error:", err);
    return ErrorResponse("Something went wrong while creating order", 500);
  }
}
