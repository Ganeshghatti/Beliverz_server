const adminModel = require("../../../Model/Admin");
const instructorModel = require("../../../Model/Instructor");
const courseModel = require("../../../Model/Course");
const categoryModel = require("../../../Model/Category");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const axios = require("axios");
const moment = require("moment");
const { sendErrorEmail } = require("../utils/Errormail");
const uuid = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

exports.GetCoursebyId = async (req, res, next) => {
  const { courseId } = req.params;
  try {
    const course = await courseModel.findOne({ courseId });

    if (!course) {
      return res
        .status(404)
        .json({ error: `Course with ID ${courseId} not found` });
    }
    res.status(200).json({ course: course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.EditCourse = async (req, res, next) => {
  const { courseId } = req.params;
  const updatedCourseDetails = req.body;

  try {
    const course = await courseModel.findOne({ courseId });

    if (!course) {
      return res
        .status(404)
        .json({ error: `Course with ID ${courseId} not found` });
    }
    course.courseName = updatedCourseDetails.courseName;
    course.courseDescription = updatedCourseDetails.courseDescription;
    course.language = updatedCourseDetails.language;
    course.courseDetail.tags = updatedCourseDetails.courseDetail.tags;
    course.courseDetail.totalHours =
      updatedCourseDetails.courseDetail.totalHours;
    course.payment = updatedCourseDetails.payment;
    course.amountInINR = updatedCourseDetails.amountInINR;
    course.courseInfo.level = updatedCourseDetails.courseInfo.level;
    course.introVideo = updatedCourseDetails.introVideo;
    course.thumbnail = updatedCourseDetails.thumbnail;

    await course.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.newChapter = async (req, res, next) => {
  const { courseId } = req.params;
  const { chapterName, email } = req.body;

  const prefix = "CHAP";
  const uniquePart = uuid.v4().replace(/-/g, "").substr(0, 6);
  const chapterId = `${prefix}${uniquePart}`;

  try {
    const course = await courseModel.findOne({ courseId });

    if (!course) {
      return res
        .status(404)
        .json({ error: `Course with ID ${courseId} not found` });
    }

    course.chapters.push({
      chapterName,
      chapterId,
      createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
      createdBy: email,
    });
    course.courseDetail.numberOfChapters++;

    await course.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.GetInstructorsByCORSID = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    const instructors = await instructorModel.find({
      coursesAllowed: { $elemMatch: { courseId: courseId } },
    });

    res.status(200).json({ instructors: instructors });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.UploadChapterContent = async (req, res, next) => {
  const { courseId } = req.params;
  const { content, chapterId, email } = req.body;
  console.log(req.body);
  try {
    const course = await courseModel.findOne({ courseId });

    if (!course) {
      return res
        .status(404)
        .json({ error: `Course with ID ${courseId} not found` });
    }

    const chapterIndex = course.chapters.findIndex(
      (item) => item.chapterId === chapterId
    );

    if (chapterIndex !== -1) {
      let newContent = {};

      switch (content.type) {
        case "Video":
          newContent = {
            contentUrl: content.VideoURL,
            contentName: content.VideoName,
            contentId: content.contentId,
          };
          break;
        case "Pdf":
          newContent = {
            contentUrl: content.PdfURL,
            contentName: content.PdfName,
            contentId: content.contentId,
          };
          break;
        default:
          return res.status(400).json({ error: "Invalid content type" });
      }

      newContent.type = content.type;
      newContent.createdAt = moment().format("MMMM Do YYYY, h:mm:ss a");
      newContent.createdBy = email;

      course.chapters[chapterIndex].content.push(newContent);
    } else {
      return res.status(404).json({
        error: `Chapter with ID ${chapterId} not found in the course`,
      });
    }

    await course.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.DeleteChapter = async (req, res, next) => {
  const { courseId, chapterId } = req.params;

  try {
    const course = await courseModel.findOne({ courseId });

    if (!course) {
      return res
        .status(404)
        .json({ error: `Course with ID ${courseId} not found` });
    }

    const chapterIndex = course.chapters.findIndex(
      (chapter) => chapter.chapterId === chapterId
    );

    if (chapterIndex === -1) {
      return res
        .status(404)
        .json({
          error: `Chapter with ID ${chapterId} not found in the course`,
        });
    }

    course.chapters.splice(chapterIndex, 1);
    course.courseDetail.numberOfChapters--;

    await course.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.DeleteChapterContent = async (req, res, next) => {
  const { courseId, chapterId, contentId } = req.params;

  try {
    const course = await courseModel.findOne({ courseId });

    if (!course) {
      return res
        .status(404)
        .json({ error: `Course with ID ${courseId} not found` });
    }

    const chapterIndex = course.chapters.findIndex(
      (item) => item.chapterId === chapterId
    );

    if (chapterIndex !== -1) {
      const contentIndex = course.chapters[chapterIndex].content.findIndex(
        (item) => item.contentId === contentId
      );

      if (contentIndex !== -1) {
        course.chapters[chapterIndex].content.splice(contentIndex, 1);
      } else {
        return res.status(404).json({
          error: `Content with ID ${contentId} not found in the chapter`,
        });
      }
    } else {
      return res.status(404).json({
        error: `Chapter with ID ${chapterId} not found in the course`,
      });
    }

    await course.save();

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
