const mongoose = require("mongoose");

const instructorSchema = new mongoose.Schema({
  instructorName: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  instructorId: {
    type: String,
    required: true,
    unique: true,
  },
  isInstructor: {
    type: Boolean,
  },
  coursesAllowed: [
    {
      courseId: {
        type: String,
      },
      courseName: {
        type: String,
      },
    },
  ],
  photo: {
    type: String,
  },
  lastUpdate: {
    type: String,
  },
  createdAt: {
    type: String,
    immutable: true,
  },
  createdBy: {
    type: String,
    immutable: true,
  },
});

const Instructor = mongoose.model("Instructor", instructorSchema);

module.exports = Instructor;
