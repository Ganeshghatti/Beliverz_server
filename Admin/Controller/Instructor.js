const instructorModel = require("../../Model/Instructor");
const courseModel = require("../../Model/Course");
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

const app = express();
app.use(cors());
app.use(bodyParser.json());

exports.InstructorLogin = async (req, res, next) => {
  const { email, password } = req.body;
  console.log(req.body);
  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Internal server error",
        error: "enter a valid email",
      });
    }
    const instructor = await instructorModel.findOne({ email: email });
    console.log(instructor);
    if (!instructor) {
      return res.status(401).json({
        message: "Internal server error",
        error: "wrong email or password",
      });
    }

    const match = await bcrypt.compare(password, instructor.password);
    if (!match) {
      return res.status(400).json({
        message: "Internal server error",
        error: "wrong email or password",
      });
    }

    const token = jwt.sign(
      { userId: instructor._id, email: instructor.email },
      process.env.INSTRUCTORJWTSECRET
    );

    res.status(200).json({
      email: instructor.email,
      token: token,
      isInstructor: instructor.isInstructor,
    });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: "Internal server error",
    });
  }
};

exports.getAccessibleCourseNames = async (req, res, next) => {
  try {
    const accessibleCourses = [];
    console.log(res.locals.instructor);
    for (let i = 0; i < res.locals.instructor.coursesAllowed.length; i++) {
      const courseId = res.locals.instructor.coursesAllowed[i].courseId;

      const oneCourse = await courseModel.findOne({ courseId });

      if (oneCourse) {
        accessibleCourses.push({
          courseId: oneCourse.courseId,
          courseName: oneCourse.courseName,
          courserating: oneCourse.rating,
          thumbnail: oneCourse.thumbnail,
          courseCategory: oneCourse.courseCategory,
          payment: oneCourse.payment,
        });
      }
    }

    res.status(200).json({ courses: accessibleCourses });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.getInstructor = async (req, res, next) => {
  try {
    console.log(res.locals.instructor);
    const instructorId = res.locals.instructor.instructorId;

    const instructor = await instructorModel.findOne({ instructorId });

    const datatosend = {
      instructorName: instructor.instructorName,
      email: instructor.email,
      instructorId: instructor.instructorId,
      photo: instructor.photo,
      coursesAllowed:instructor.coursesAllowed
    };

    res.status(200).json({ instructor: datatosend });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.ChangePassword = async (req, res, next) => {
  const { formData, email } = req.body;
  try {
    const instructor = await instructorModel.findOne({ email });
    if (!instructor) {
      return res.status(404).json({
        error: "Instructor Not Found",
      });
    }
    const match = await bcrypt.compare(
      formData.oldpassword,
      instructor.password
    );
    if (!match) {
      return res.status(400).json({
        error: "Wrong password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(formData.password, salt);

    instructor.password = hash;

    await instructor.save();

    res.status(200).json({
      msg: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password" });
  }
};

exports.ChangePhotoAndName = async (req, res, next) => {
  const { formData, email } = req.body;
  try {
    const instructor = await instructorModel.findOne({ email });
    if (!instructor) {
      return res.status(404).json({
        error: "Instructor Not Found",
      });
    }

    instructor.name = formData.name;
    instructor.photo = formData.photo;

    await instructor.save();

    res.status(200).json({
      msg: "Profile Updated Successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};
