const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
  questions: [
    {
      questionText: String,
      options: [
        { optionText: String, isCorrect: Boolean },
        { optionText: String, isCorrect: Boolean },
        { optionText: String, isCorrect: Boolean },
        { optionText: String, isCorrect: Boolean },
      ],
    },
  ],
  maxTime: Number,
  createdAt: String,
  createdBy: String,
  lastUpdate: String,
  TestSeriesDescription: {
    type: String,
  },
  testInstructions: [String],
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
  totalEnrollments: {
    type: Number,
    default: 0,
  },
  testseriesId: {
    type: String,
    unique: true,
  },
  testseriesName: {
    type: String,
    required: true,
  },
  numberofQuestions:{
    type:Number
  },
  thumbnail: {
    type: String,
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
});

const TestSeries = mongoose.model("TestSeries", testSchema);

module.exports = TestSeries;
