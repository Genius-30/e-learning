import mongoose, { Schema } from "mongoose";
import Section from "./section.model";

const LectureSchema = new Schema(
  {
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: [true, "Please provide a section ID"],
    },
    title: {
      type: String,
      required: [true, "Please provide a lecture title"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    videoUrl: {
      type: String,
      trim: true,
      default: "",
    },
    publicId: {
      type: String,
      required: [true, "Please provide the Cloudinary public ID"],
      trim: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    duration: {
      type: Number,
      required: [true, "Please provide a duration"],
    },
    index: {
      type: Number,
      required: [true, "Please provide an index"],
    },
    isFreePreview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

LectureSchema.index({ sectionId: 1, index: 1 });

// Function to update totalHours in Section and Course
async function updateSectionAndCourse(sectionId) {
  const section = await Section.findById(sectionId);
  if (section) {
    await section.updateTotalHours();
  }
}

// Update totalHours when a lecture is added or updated
LectureSchema.post("save", async function () {
  try {
    await updateSectionAndCourse(this.sectionId);
  } catch (error) {
    console.log("Error updating total hours:", error);
  }
});

// Update totalHours when a lecture is removed
LectureSchema.post("remove", async function () {
  try {
    await updateSectionAndCourse(this.sectionId);
  } catch (error) {
    console.log("Error updating total hours:", error);
  }
});

const Lecture =
  mongoose.models.Lecture || mongoose.model("Lecture", LectureSchema);

export default Lecture;
