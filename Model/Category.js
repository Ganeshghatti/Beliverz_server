const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
  },
  categoryId: {
    type: String,
    required: true,
  },
  categoryImg: {
    type: String,
    required: true,
  },
  courses: [
    {
      courseName: {
        type: String,
      },
      courseId: {
        type: String,
      },
    },
  ],
});

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;