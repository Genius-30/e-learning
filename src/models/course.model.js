import { courseCategories } from "@/constants/courseCategories";
import Section from "@/models/section.model";
import mongoose, { Schema } from "mongoose";

const CourseSchema = new Schema(
  {
    thumbnail: {
      type: String,
    },
    title: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    purchaseOptions: {
      online: {
        price: {
          type: Number,
          min: 0,
        },
        discount: {
          percentage: { type: Number, default: 0, min: 0, max: 100 },
          validUntil: { type: Date, default: null },
        },
      },
      hybrid: {
        price: {
          type: Number,
          min: 0,
        },
        discount: {
          percentage: { type: Number, default: 0, min: 0, max: 100 },
          validUntil: { type: Date, default: null },
        },
      },
    },
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    category: {
      type: String,
      enum: courseCategories,
      default: "Other",
    },
    durationWeeks: {
      type: Number,
      min: 1,
    },
    totalHours: {
      type: Number,
      default: 0,
    },
    purchaseStats: {
      online: { type: Number, default: 0 },
      hybrid: { type: Number, default: 0 },
    },
    sections: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Section",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// indexing the title and category field for faster searchh
CourseSchema.index({ title: 1 });
CourseSchema.index({ category: 1 });
CourseSchema.index({ category: 1, title: 1 });

// Auto-update totalHours when lectures are modified
CourseSchema.statics.updateTotalHours = async function (courseId) {
  const Section = mongoose.model("Section");

  // Sum up the totalHours of all sections belonging to this course
  const totalHoursAggregation = await Section.aggregate([
    { $match: { courseId: new mongoose.Types.ObjectId(courseId) } },
    { $group: { _id: null, totalHours: { $sum: "$totalHours" } } },
  ]);

  const totalHours =
    totalHoursAggregation.length > 0 ? totalHoursAggregation[0].totalHours : 0;

  await this.findByIdAndUpdate(courseId, { totalHours });
};

CourseSchema.methods.incrementPurchase = async function (type) {
  if (!["online", "hybrid"].includes(type)) return;

  this.purchaseStats[type] = (this.purchaseStats[type] || 0) + 1;
  await this.save();
};

// Remove related sections & lectures when a course is deleted
CourseSchema.pre("remove", async function (next) {
  const Section = mongoose.model("Section");
  const Lecture = mongoose.model("Lecture");

  // Find all section IDs in this course
  const sectionIds = await Section.find({ courseId: this._id }).distinct("_id");

  // Bulk delete lectures in all sections
  await Lecture.deleteMany({ sectionId: { $in: sectionIds } });

  // Bulk delete all sections
  await Section.deleteMany({ courseId: this._id });

  next();
});

// 🔗 Auto-populate sections when querying courses
CourseSchema.pre(/^find/, function (next) {
  this.populate({
    path: "sections",
    select: "title",
    options: { sort: { index: 1 } },
    populate: {
      path: "lectures",
      select: "title duration videoUrl",
      options: { sort: { index: 1 } },
    },
  });
  next();
});

CourseSchema.pre("save", function (next) {
  const now = new Date();

  if (
    this.purchaseOptions?.online?.discount?.validUntil &&
    this.purchaseOptions.online.discount.validUntil < now
  ) {
    this.purchaseOptions.online.discount = {
      percentage: 0,
      validUntil: undefined,
    };
  }

  if (
    this.purchaseOptions?.hybrid?.discount?.validUntil &&
    this.purchaseOptions.hybrid.discount.validUntil < now
  ) {
    this.purchaseOptions.hybrid.discount = {
      percentage: 0,
      validUntil: undefined,
    };
  }

  next();
});

const Course = mongoose.models.Course || mongoose.model("Course", CourseSchema);

export default Course;
