import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    purchaseType: {
      type: String,
      enum: ["online", "hybrid"],
      required: true,
    },

    amountPaid: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "failed",
    },

    paymentId: {
      type: String,
      unique: true,
      default: null,
    },

    orderId: {
      type: String,
      default: null, // Razorpay: order ID, Stripe: payment intent ID, etc.
    },

    gatewaySignature: {
      type: String,
      default: null, // For verification (e.g., Razorpay signature)
    },

    paymentGateway: {
      type: String,
      enum: ["stripe", "razorpay"],
      required: true,
    },

    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// 🔹 Ensures the model is not recompiled when using hot reloads
const Payment =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);

export default Payment;
