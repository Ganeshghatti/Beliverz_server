const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: String,
  createdAt: {
    type: String,
    immutable: true,
  },
  username: String,
  coursesEnrolled: [
    {
      courseId: String,
      enrolldate: String,
      enrolltime: String,
      feedback: Object,
      currentlywatching: {
        courseId: String,
        chapterId: String,
        contentId: String,
      },
    },
  ],
});

module.exports = mongoose.model("users", UserSchema);
