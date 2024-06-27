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
  SubmitFeedback,
  ForgotPassword,
  ResetPassword,
  GetAllTestseriesNames,
  GetTestseriesById,
  GetInstructorsByTestseriesID,
  EnrollTestseries,
  GetTestseriesContent,
  SubmitTest,
  CheckResult,
  Test,
} = require("../Controller/User");
const requireAuth = require("../middleware/User");

router.route("/user/register").post(register);
router.route("/user/login").post(login);

router.route("/user/get-all-category").get(GetAllCategory);
router.route("/user/get-all-coursenames").get(GetAllCourseNames);
router.route("/user/get-all-testseriesnames").get(GetAllTestseriesNames);

router.route("/user/form").post(postForm);

router.route("/user/courses/:courseId").get(GetCoursebyId);
router.route("/user/testseries/:testseriesId").get(GetTestseriesById);

router.route("/user/courses/:courseId/instructors").get(GetInstructorsByCORSID);
router
  .route("/user/testseries/:testseriesId/instructors")
  .get(GetInstructorsByTestseriesID);

router
  .route("/user/courses/:courseId/course-enroll")
  .post(requireAuth, EnrollCourse);
router
  .route("/user/testseries/:testseriesId/testseries-enroll")
  .post(requireAuth, EnrollTestseries);

router
  .route("/user/courses/:courseId/:email/:chapterId/:contentId")
  .get(requireAuth, GetCourseContent);
  
router
.route("/user/testseries/:testseriesId/:email/test")
.get(requireAuth, GetTestseriesContent);

router
.route("/user/testseries/:testseriesId/:email/submit")
.post(requireAuth, SubmitTest);

router
.route("/user/testseries/:testseriesId/:email/results")
.get(requireAuth, CheckResult);

router
  .route("/user/courses/:courseId/get-chapters-list")
  .get(requireAuth, GetChaptersList);

router.route("/user/account/:email").get(requireAuth, MyAccount);
router
  .route("/user/courses/:courseId/:email/submitfeedback")
  .post(requireAuth, SubmitFeedback);
router.route("/user/forgot-password").post(ForgotPassword);
router.route("/user/reset-password/:resetPasswordToken").post(ResetPassword);

router.route("/test").get(Test);

module.exports = router;
