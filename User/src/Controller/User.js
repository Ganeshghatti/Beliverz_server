const users = require("../../../Model/User");
const categoryModel = require("../../../Model/Category");
const courseModel = require("../../../Model/Course");
const userModel = require("../../../Model/User");
const formModel = require("../../../Model/Form");
const instructorModel = require("../../../Model/Instructor");
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
      createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
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
    console.log(error);
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

exports.GetInstructorsByCORSID = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    const instructors = await instructorModel
      .find({ coursesAllowed: { $elemMatch: { courseId: courseId } } })
      .select("instructorName instructorId photo");

    res.status(200).json({ instructors: instructors });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.GetChaptersList = async (req, res, next) => {
  const { courseId } = req.params;

  try {
    const course = await courseModel.findOne({ courseId });
    if (!course) {
      return res.status(404).json({ error: `Course not found` });
    }

    const filteredChapters = course.chapters.map(
      ({ chapterName, chapterId, content }) => ({
        chapterName,
        chapterId,
        content,
      })
    );

    res.status(200).json({ chapters: filteredChapters });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.EnrollCourse = async (req, res, next) => {
  const { courseId } = req.params;
  const { email, bodycourseId } = req.body;

  try {
    if (req.user.email === email) {
      const user = await userModel.findOne({ email });

      const isEnrolled = user.coursesEnrolled.some(
        (course) => course.courseId === courseId
      );

      if (isEnrolled) {
        return res
          .status(400)
          .json({ error: "User is already enrolled in this course." });
      }

      const course = await courseModel.findOne({ courseId });
      course.courseInfo.totalEnrollments++;
      await course.save();

      user.coursesEnrolled.push({
        courseId,
        enrolldate: moment().add(10, "days").calendar(),
        enrolltime: moment().format("LT"),
        currentlywatching: {
          courseId: course.courseId,
          chapterId: course.chapters[0].chapterId,
          contentId: course.chapters[0].content[0].contentId,
        },
      });
      await user.save();

      res.status(200).json({
        courseId: course.courseId,
        chapterId: course.chapters[0].chapterId,
        contentId: course.chapters[0].content[0].contentId,
      });
    } else {
      return res.status(500).json({ error: "Internal server error" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.GetCourseContent = async (req, res, next) => {
  console.log(req.params);
  const { courseId, email, chapterId, contentId } = req.params;

  try {
    const course = await courseModel.findOne({ courseId });

    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Invalid User" });
    }

    const isEnrolled = user.coursesEnrolled.some(
      (enrolledCourse) => enrolledCourse.courseId === courseId
    );

    if (!isEnrolled) {
      return res
        .status(400)
        .json({ error: "User is not enrolled in this course." });
    }

    const currentlywatchingIndex = user.coursesEnrolled.findIndex(
      (enrolledCourse) => enrolledCourse.courseId === courseId
    );

    user.coursesEnrolled[currentlywatchingIndex].currentlywatching = {
      courseId,
      chapterId,
      contentId,
    };

    await user.save();

    const chapter = course.chapters.find((c) => c.chapterId === chapterId);

    if (!chapter) {
      return res.status(404).json({ error: "Chapter not found" });
    }

    const content = chapter.content.find((c) => c.contentId === contentId);

    if (!content) {
      user.coursesEnrolled[currentlywatchingIndex].currentlywatching = {
        courseId: course.courseId,
        chapterId: course.chapters[0].chapterId,
        contentId: course.chapters[0].content[0].contentId,
      };
      await user.save();

      return res.status(200).json({
        content: course.chapters[0].content[0],
        currentlywatching:
          user.coursesEnrolled[currentlywatchingIndex].currentlywatching,
      });
    }
    await user.save();

    res.status(200).json({
      content,
      currentlywatching:
        user.coursesEnrolled[currentlywatchingIndex].currentlywatching,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.MyAccount = async (req, res, next) => {
  const { email } = req.params;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    for (const item of user.coursesEnrolled) {
      const course = await courseModel.findOne({ courseId: item.courseId });

      if (course) {
        item.courseName = course.courseName;
        item.thumbnail = course.thumbnail;
      } else {
        console.error(`Course not found for courseId: ${item.courseId}`);
      }
    }

    res.status(200).json({ user });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
