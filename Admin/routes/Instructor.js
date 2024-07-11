const express = require("express");
const router = express.Router();
const { InstructorLogin, getAccessibleCourseNames, getInstructor, ChangePassword, ChangePhotoAndName, getAccessibleTestseriesNames } = require("../Controller/Instructor");
const instructorAuthMiddleware = require("../middleware/Instructor");

router.route("/instructor/login").post(InstructorLogin);

router.route("/instructor/get-accessible-course").get(instructorAuthMiddleware, getAccessibleCourseNames);
router.route("/instructor/get-accessible-testseries").get(instructorAuthMiddleware, getAccessibleTestseriesNames);
router.route("/instructor/get-instructor").get(instructorAuthMiddleware, getInstructor);
router.route("/instructor/change-password").post(instructorAuthMiddleware, ChangePassword);
router.route("/instructor/change-photoAndName").post(instructorAuthMiddleware, ChangePhotoAndName);

module.exports = router;
