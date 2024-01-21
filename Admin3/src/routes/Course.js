const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/Course");
const { GetCoursebyId, EditCourse, newChapter, GetInstructorsByCORSID, UploadChapterContent } = require("../Controller/Course");

router.route("/courses/:courseId").get(requireAuth, GetCoursebyId);
router.route("/courses/:courseId").put(requireAuth, EditCourse);
router.route("/courses/:courseId/newchapter").post(requireAuth, newChapter);
router.route("/courses/:courseId/instructors").get(requireAuth, GetInstructorsByCORSID);
router.route("/courses/:courseId/upload-content").post(requireAuth, UploadChapterContent);

module.exports = router;
