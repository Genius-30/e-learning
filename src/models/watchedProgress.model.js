import mongoose from "mongoose";

const watchedProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      required: true,
    },
    watchedDuration: {
      type: Number,
      default: 0, // in seconds
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure unique combination of user, course, and lecture
watchedProgressSchema.index(
  { user: 1, course: 1, lecture: 1 },
  { unique: true }
);

const WatchedProgress =
  mongoose.models.WatchedProgress ||
  mongoose.model("WatchedProgress", watchedProgressSchema);

export default WatchedProgress;
