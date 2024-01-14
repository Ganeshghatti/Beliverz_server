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
} = require("../Controller/Admin");
const requireAuth = require("../middleware/Admin");
const { CreateCourse, GetAllCourse } = require("../Controller/Admin");

router.route("/admin/login").post(AdminLogin);

router.use(requireAuth);

router.route("/admin/create-course").post(CreateCourse);
router.route("/admin/get-all-course").get(GetAllCourse);
router.route("/admin/create-instructor").post(CreateInstructor);
router.route("/admin/get-all-instructors").get(GetAllInstructors);
router.route("/admin/get-all-course-names").get(GetAllCourseNames);
router.route("/admin/get-all-category").get(GetAllCategory);
router.route("/admin/edit-category").put(EditCategory);
router.route("/admin/edit-instructor/:instructorId").patch(EditInstructor);
router.route("/admin/delete-instructor/:instructorId").delete(DeleteInstructor);
router.route("/admin/change-password").post(ChangePassword);

module.exports = router;
