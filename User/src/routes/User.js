const express = require("express");
const router = express.Router();
const {register,login, GetAllCategory, GetAllCourseNames, postForm, GetCoursebyId} = require("../Controller/User");

router.route("/user/register").post(register);
router.route("/user/login").post(login);
router.route("/user/get-all-category").get(GetAllCategory);
router.route("/user/get-all-coursenames").get(GetAllCourseNames);
router.route("/user/form").post(postForm);
router.route("/user/courses/:courseId").get(GetCoursebyId);

module.exports = router;
