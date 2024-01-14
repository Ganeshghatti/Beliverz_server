const users = require("../../../Model/User");
const categoryModel = require("../../../Model/Category");
const courseModel = require("../../../Model/Course");
const userModel = require("../../../Model/User");
const formModel = require("../../../Model/Form");
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
const FormData = require("form-data");
const { sendErrorEmail } = require("../utils/Errormail");

const app = express();
app.use(cors());
app.use(bodyParser.json());

exports.register = async (req, res, next) => {
  const userdata = req.body;

  try {
    if (!validator.isEmail(userdata.email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (!validator.isStrongPassword(userdata.password)) {
      return res.status(400).json({
        error:
          "Weak password. Must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const existingUser = await userModel.findOne({ email: userdata.email });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(userdata.password, salt);

    const user = new userModel({
      username: userdata.username,
      email: userdata.email,
      password: hash,
    });

    const newUser = await user.save();

    const token = jwt.sign({ userId: newUser._id }, process.env.JWTSECRET);

    res.status(200).json({
      email: newUser.email,
      username: newUser.username,
      token: token,
    });
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).send({ error: "Failed to register user" });
  }
};

exports.login = async (req, res, next) => {
  const userdata = req.body;

  try {
    if (!validator.isEmail(userdata.email)) {
      return res.status(400).send("Enter a valid email");
    }
    const existingUser = await users.findOne({ email: userdata.email });
    if (!existingUser) {
      return res.status(400).json({ error: "Wrong email or password" });
    }
    const match = await bcrypt.compare(
      userdata.password,
      existingUser.password
    );
    if (!match) {
      return res.status(400).json({ error: "Wrong email or password" });
    }

    const jwttoken = jwt.sign(
      { userId: existingUser._id },
      process.env.JWTSECRET
    );

    res.status(200).json({
      email: existingUser.email,
      username: existingUser.username,
      token: jwttoken,
      isVerified: existingUser.isVerified,
    });
  } catch (error) {
    sendErrorEmail(
      userdata.name,
      userdata.email,
      "User tried to login. Internal server error"
    );
    res.status(500).json({ error: "Oops! Please try again later" });
  }
};

exports.GetAllCategory = async (req, res, next) => {
  try {
    console.log("object");
    const allCategory = await categoryModel.find();
    res.status(200).json({ category: allCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Oops! Please try again later" });
  }
};

exports.GetAllCourseNames = async (req, res, next) => {
  try {
    const allcourses = await courseModel.find();

    const simplifiedCourses = allcourses.map((course) => ({
      courseName: course.courseName || null,
      courseId: course.courseId || null,
      coursethumbnail: course.thumbnail || null,
      coursepayment: course.payment || null,
      courseamountInINR: course.amountInINR || null,
      coursetotalEnrollments: course.courseInfo
        ? course.courseInfo.totalEnrollments || null
        : null,
      coursetags: course.courseDetail ? course.courseDetail.tags || null : null,
      courserating: course.rating || null,
      courselanguage: course.language || null,
    }));

    res.status(200).json({ courses: simplifiedCourses });
  } catch (error) {
    res.status(500).json({ error: "Oops! Please try again later" });
  }
};

exports.postForm = async (req, res, next) => {
  try {
    const { email, phone, name, query } = req.body;

    if (!validator.isMobilePhone(phone)) {
      return res
        .status(400)
        .json({ error: "Please enter a valid phone number" });
    }

    const form = new formModel({
      date: moment().add(10, "days").calendar(),
      time: moment().format("LT"),
      email,
      phone,
      name,
      query,
    });

    await form.save();

    return res
      .status(200)
      .json({ message: "We will reach out to you as soon as possible" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Oops! Please try again later" });
  }
};

exports.GetCoursebyId = async (req, res, next) => {
  const { courseId } = req.params;
  console.log(courseId);
  try {
    const course = await courseModel.findOne({ courseId });

    if (!course) {
      return res.status(404).json({ error: `Course not found` });
    }
    res.status(200).json({ course: course });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
