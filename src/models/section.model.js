import mongoose, { Schema } from "mongoose";
import Lecture from "./lecture.model";
import Course from "./course.model";

const SectionSchema = new Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Please provide a section title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    index: {
      type: Number,
      required: true,
      min: [0, "Section index must be greater than or equal to 0"],
      index: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    lectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],
    totalHours: {
      type: Number,
      default: 0,
    },
    notesUrls: [
      {
        url: {
          type: String,
          trim: true,
        },
        title: {
          type: String,
          trim: true,
          required: [true, "Please provide a title for the notes"],
        },
        fileType: {
          type: String,
          enum: ["pdf", "docx", "pptx", "image"],
          default: "pdf",
        },
        uploadedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

// Function to update totalHours dynamically
SectionSchema.methods.updateTotalHours = async function () {
  const lectures = await Lecture.find({ sectionId: this._id });
  const totalDuration = lectures.reduce(
    (sum, lecture) => sum + lecture.duration,
    0
  );

  this.totalHours = Math.round((totalDuration / 3600) * 100) / 100; // Convert sections to hours
  await this.save();

  // Update total course hours
  await Course.updateTotalHours(this.courseId);
};

const Section =
  mongoose.models.Section || mongoose.model("Section", SectionSchema);

export default Section;
