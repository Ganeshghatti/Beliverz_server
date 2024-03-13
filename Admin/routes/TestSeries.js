const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/Course");
const {
  GetCoursebyId,
  EditCourse,
  newChapter,
  GetInstructorsByCORSID,
  UploadChapterContent,
  DeleteChapter,
  DeleteChapterContent,
  editChapterName,
} = require("../Controller/Course");
const { GetTestseriesbyId,GetInstructorsByTESTID, EditTestSeries } = require("../Controller/TestSeries");

router.route("/testseries/:testseriesId").get(requireAuth, GetTestseriesbyId);
router
  .route("/testseries/:testseriesId/instructors")
  .get(requireAuth, GetInstructorsByTESTID);
  router.route("/testseries/:testseriesId").put(requireAuth, EditTestSeries);



  
router.route("/courses/:courseId/newchapter").post(requireAuth, newChapter);
router
  .route("/courses/:courseId/instructors")
  .get(requireAuth, GetInstructorsByCORSID);
router
  .route("/courses/:courseId/upload-content")
  .post(requireAuth, UploadChapterContent);
router
  .route("/courses/:courseId/delete-chapter/:chapterId")
  .delete(requireAuth, DeleteChapter);
router
  .route("/courses/:courseId/edit-chapterName/:chapterId")
  .put(requireAuth, editChapterName);
router
  .route("/courses/:courseId/delete-content/:chapterId/:contentId")
  .delete(requireAuth, DeleteChapterContent);

module.exports = router;
