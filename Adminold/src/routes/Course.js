const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/Course");
const { GetCoursebyId } = require("../Controller/Course");

router.route("/admin/course/:courseId").get(requireAuth, GetCoursebyId);

module.exports = router;
