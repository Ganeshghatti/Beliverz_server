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

    await course.save()
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
