const express = require("express");
const router = express.Router();
const {
  AdminLogin,
  GetAllInstructors,
  CreateInstructor,
  GetAllCourseNames,
  GetAllCategory,
  EditCategory,
  EditInstructor,
  DeleteInstructor,
  ChangePassword,
  GetFormData,
  GetAllUsers,
  GetAllTestSeries,
  CreateTestSeries,
  GetAllTestseriesNames,
} = require("../Controller/Admin");
const requireAuth = require("../middleware/Admin");
const { CreateCourse, GetAllCourse } = require("../Controller/Admin");

router.route("/admin/login").post(AdminLogin);

router.route("/admin/create-course").post(requireAuth,CreateCourse);
router.route("/admin/create-testseries").post(requireAuth,CreateTestSeries);
router.route("/admin/get-all-course").get(requireAuth,GetAllCourse);
router.route("/admin/get-all-testseries").get(requireAuth,GetAllTestSeries);
router.route("/admin/create-instructor").post(requireAuth,CreateInstructor);
router.route("/admin/get-all-instructors").get(requireAuth,GetAllInstructors);
router.route("/admin/get-all-course-names").get(requireAuth,GetAllCourseNames);
router.route("/admin/get-all-testseries-names").get(requireAuth,GetAllTestseriesNames);
router.route("/admin/get-all-category").get(requireAuth,GetAllCategory);
router.route("/admin/edit-category").put(requireAuth,EditCategory);
router.route("/admin/edit-instructor/:instructorId").patch(requireAuth,EditInstructor);
router.route("/admin/delete-instructor/:instructorId").delete(requireAuth,DeleteInstructor);
router.route("/admin/change-password").post(requireAuth,ChangePassword);
router.route("/admin/get-formdata").get(requireAuth,GetFormData);
router.route("/admin/get-all-users").get(requireAuth,GetAllUsers);

module.exports = router;
