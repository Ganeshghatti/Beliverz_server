const express = require("express");
const router = express.Router();
const {
  register,
  login,
  GetAllCategory,
  GetAllCourseNames,
  postForm,
  GetCoursebyId,
  GetInstructorsByCORSID,
  EnrollCourse,
  GetCourseContent,
  GetChaptersList,
  MyAccount,
} = require("../Controller/User");
const requireAuth = require("../middleware/User");

router.route("/user/register").post(register);
router.route("/user/login").post(login);
router.route("/user/get-all-category").get(GetAllCategory);
router.route("/user/get-all-coursenames").get(GetAllCourseNames);
router.route("/user/form").post(postForm);
router.route("/user/courses/:courseId").get(GetCoursebyId);
router.route("/user/courses/:courseId/instructors").get(GetInstructorsByCORSID);
router.route("/user/courses/:courseId/course-enroll").post(requireAuth,EnrollCourse);
router.route("/user/courses/:courseId/:email/:chapterId/:contentId").get(requireAuth,GetCourseContent);
router.route("/user/courses/:courseId/get-chapters-list").get(requireAuth,GetChaptersList);
router.route("/user/account/:email").get(requireAuth,MyAccount);

module.exports = router;
