const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/Course");
const { GetCoursebyId, EditCourse } = require("../Controller/Course");

router.route("/courses/:courseId").get(requireAuth, GetCoursebyId);
router.route("/courses/:courseId").put(requireAuth, EditCourse);

module.exports = router;
