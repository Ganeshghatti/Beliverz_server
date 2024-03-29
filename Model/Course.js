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
      type: String,
      default: 0,
    },
  },
  chapters: [
    {
      chapterName: {
        type: String,
        required: true,
      },
      chapterId: {
        type: String,
        required: true,
        unique: true,
      },
      createdAt: String,
      createdBy: String,
      content: [Object],
    },
  ],
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
  reviews: [Object],
  introVideo: {
    type: String,
    default: "",
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
  lastUpdate: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    decimal: true,
  },
  NumberOfRatings: {
    type: Number,
    default: 0,
  },
  courseId: {
    type: String,
    unique: true,
  },
});

const Course = mongoose.model("Course", courseSchema);

module.exports = Course;
