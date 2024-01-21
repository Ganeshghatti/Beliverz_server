const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/Course");
const { GetCoursebyId, EditCourse, newChapter, GetInstructorsByCORSID, UploadChapterContent, DeleteChapter } = require("../Controller/Course");

router.route("/courses/:courseId").get(requireAuth, GetCoursebyId);
router.route("/courses/:courseId").put(requireAuth, EditCourse);
router.route("/courses/:courseId/newchapter").post(requireAuth, newChapter);
router.route("/courses/:courseId/instructors").get(requireAuth, GetInstructorsByCORSID);
router.route("/courses/:courseId/upload-content").post(requireAuth, UploadChapterContent);
router.route("/courses/:courseId/delete-chapter/:chapterId").delete(requireAuth, DeleteChapter);

module.exports = router;
