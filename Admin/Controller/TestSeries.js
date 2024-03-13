const adminModel = require("../../Model/Admin");
const instructorModel = require("../../Model/Instructor");
const courseModel = require("../../Model/Course");
const categoryModel = require("../../Model/Category");
const testseriesModel = require("../../Model/TestSeries");
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

exports.GetTestseriesbyId = async (req, res, next) => {
  const { testseriesId } = req.params;
  try {
    console.log(testseriesId);
    const testseries = await testseriesModel.findOne({
      testseriesId: testseriesId,
    });
    console.log(testseries);
    if (!testseries) {
      return res
        .status(404)
        .json({ error: `Test with ID ${testseriesId} not found` });
    }
    res.status(200).json({ testseries });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.EditTestSeries = async (req, res, next) => {
  const { testseriesId } = req.params;
  const { email, updatedtestseriesDetails } = req.body;

  try {
    const testseries = await testseriesModel.findOne({ testseriesId });

    if (!testseries) {
      return res
        .status(404)
        .json({ error: `Test series with ID ${testseries} not found` });
    }

    testseries.testseriesName = updatedtestseriesDetails.testseriesName;
    testseries.TestSeriesDescription =
      updatedtestseriesDetails.TestSeriesDescription;
    testseries.maxTime = updatedtestseriesDetails.maxTime;
    testseries.payment = updatedtestseriesDetails.payment;
    testseries.amountInINR = updatedtestseriesDetails.amountInINR;
    testseries.thumbnail = updatedtestseriesDetails.thumbnail;
    testseries.testInstructions = updatedtestseriesDetails.testInstructions;
    testseries.lastUpdate = `${email}, ${moment().format(
      "MMMM Do YYYY, h:mm:ss a"
    )}`;
    testseries.numberofQuestions = updatedtestseriesDetails.questions.length;
    testseries.questions = updatedtestseriesDetails.questions;
    testseries.maxTime=updatedtestseriesDetails.maxTime;

    await testseries.save();
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.GetInstructorsByTESTID = async (req, res, next) => {
  const { testseriesId } = req.params;

  try {
    const instructors = await instructorModel.find({
      testseriesAllowed: { $elemMatch: { testseriesId: testseriesId } },
    });

    res.status(200).json({ instructors });
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

exports.editChapterName = async (req, res, next) => {
  const { courseId, chapterId } = req.params;
  const { chapterName } = req.body;

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
      return res.status(404).json({
        error: `Chapter with ID ${chapterId} not found in the course`,
      });
    }

    course.chapters[chapterIndex].chapterName = chapterName;

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
      return res.status(404).json({
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
