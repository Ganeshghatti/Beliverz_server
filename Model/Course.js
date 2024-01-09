const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  courseName: {
    type: String,
    required: true,
  },
  payment: {
    type: String,
    enum: ["free", "paid"],
    default: "free",
  },
  amountInINR: {
    type: Number,
    default: 0,
  },
  courseDescription: {
    type: String,
  },
  courseInfo: {
    reviews: {
      type: Number,
      default: 0,
    },
    totalEnrollments: {
      type: Number,
      default: 0,
    },
    level: {
      type: String,
      enum: ["beginner", "intermediate", "advance"],
      default: "beginner",
    },
  },
  courseDetail: {
    tags: [String],
    numberOfChapters: {
      type: Number,
      default: 0,
    },
    requirements: [String],
    totalHours: {
      type: Number,
      default: 0,
    },
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],
  },
  courseCategory: [
    {
      categoryId: {
        type: String,
      },
      categoryName: {
        type: String,
      },
    },
  ],
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  introVideo: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  whatWillYouLearn: [String],
  instructors: [
    {
      instructorId: {
        type: String,
      },
      instructorName: {
        type: String,
      },
    },
  ],
  language: String,
  createdAt: String,
  createdBy: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    decimal: true,
  },
  courseId: {
    type: String,
    unique: true,
  },
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
