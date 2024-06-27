const users = require("../../Model/User");
const categoryModel = require("../../Model/Category");
const courseModel = require("../../Model/Course");
const userModel = require("../../Model/User");
const testseriesModel = require("../../Model/TestSeries");
const formModel = require("../../Model/Form");
const instructorModel = require("../../Model/Instructor");
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
const { v4: uuidv4 } = require("uuid");

const app = express();
app.use(cors());
app.use(bodyParser.json());

exports.Test = async (req, res, next) => {
  try {
    res.status(200).send({ success: true });
  } catch {
    res.status(500).send({ error: "Failed" });
  }
};

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

exports.GetAllTestseriesNames = async (req, res, next) => {
  try {
    const alltestseries = await testseriesModel.find();

    const simplifiedtestseries = alltestseries.map((testseries) => ({
      testseriesName: testseries.testseriesName || null,
      testseriesId: testseries.testseriesId || null,
      thumbnail: testseries.thumbnail || null,
      payment: testseries.payment || null,
      testseriesamountInINR: testseries.amountInINR || null,
      totalEnrollments: testseries.totalEnrollments || null,
      testserieserating: testseries.rating || null,
    }));

    res.status(200).json({ testseries: simplifiedtestseries });
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
  const { authorization } = req.headers;

  try {
    let isEnrolled = false;
    let course;
    let enrolledCourse = null;

    if (authorization) {
      const token = authorization.split(" ")[1];
      const { userId } = jwt.verify(token, process.env.JWTSECRET);

      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      enrolledCourse = user.coursesEnrolled.find(
        (course) => course.courseId === courseId
      );

      if (enrolledCourse) {
        isEnrolled = true;
      }
    }

    course = await courseModel.findOne({ courseId });
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    return res.status(200).json({ course, isEnrolled, enrolledCourse });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.GetTestseriesById = async (req, res, next) => {
  const { testseriesId } = req.params;
  const { authorization } = req.headers;

  try {
    let isEnrolled = false;
    let testseries;
    let enrolledTestseries = null;

    if (authorization) {
      const token = authorization.split(" ")[1];
      const { userId } = jwt.verify(token, process.env.JWTSECRET);

      const user = await userModel.findById(userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      enrolledTestseries = user.testseriesEnrolled.find(
        (testseries) => testseries.testseriesId === testseriesId
      );

      if (enrolledTestseries) {
        isEnrolled = true;
      }
    }

    testseries = await testseriesModel.findOne({ testseriesId });
    if (!testseries) {
      return res.status(404).json({ error: "testseries not found" });
    }

    return res.status(200).json({ testseries, isEnrolled, enrolledTestseries });
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
exports.GetInstructorsByTestseriesID = async (req, res, next) => {
  const { testseriesId } = req.params;

  try {
    const instructors = await instructorModel
      .find({
        testseriessAllowed: { $elemMatch: { testseriesId: testseriesId } },
      })
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

    const enrollmentData = {
      courseId,
      enrolldate: moment().add(10, "days").calendar(),
      enrolltime: moment().format("LT"),
      currentlywatching: {
        courseId: course.courseId,
        chapterId: course.chapters[0].chapterId,
        contentId: course.chapters[0].content[0].contentId,
      },
    };
    user.coursesEnrolled.push(enrollmentData);

    await user.save();

    res.status(200).json({
      currentlywatching: enrollmentData.currentlywatching,
      feedback: "",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.EnrollTestseries = async (req, res, next) => {
  const { testseriesId } = req.params;
  const { email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    const isEnrolled = user.testseriesEnrolled.some(
      (testseries) => testseries.testseriesId === testseriesId
    );

    if (isEnrolled) {
      return res
        .status(400)
        .json({ error: "User is already enrolled in this Testseries." });
    }

    const testseries = await testseriesModel.findOne({ testseriesId });
    testseries.totalEnrollments++;
    await testseries.save();

    const enrollmentData = {
      testseriesId,
      enrolldate: moment().add(10, "days").format(),
      enrolltime: moment().format("LT"),
      starttimer: moment().format("MMMM Do YYYY, h:mm:ss a"),
    };
    user.testseriesEnrolled.push(enrollmentData);

    await user.save();

    res.status(200).json({
      feedback: "",
      testseriesId,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.GetCourseContent = async (req, res, next) => {
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

    if (content == null) {
      user.coursesEnrolled[currentlywatchingIndex].currentlywatching = {
        courseId: course.courseId,
        chapterId: course.chapters[0].chapterId,
        contentId: course.chapters[0].content[0].contentId,
      };
      await user.save();

      return res.status(200).json({
        feedback: user.coursesEnrolled[currentlywatchingIndex].feedback,
        content: course.chapters[0].content[0],
        currentlywatching:
          user.coursesEnrolled[currentlywatchingIndex].currentlywatching,
      });
    }
    res.status(200).json({
      content,
      currentlywatching:
        user.coursesEnrolled[currentlywatchingIndex].currentlywatching,
      feedback: user.coursesEnrolled[currentlywatchingIndex].feedback,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.GetTestseriesContent = async (req, res) => {
  const { testseriesId, email } = req.params;

  try {
    const testseries = await testseriesModel.findOne({ testseriesId });

    if (!testseries) {
      return res.status(404).json({ error: "Testseries not found" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Invalid User" });
    }

    const isEnrolled = user.testseriesEnrolled.some(
      (enrolledtestseries) => enrolledtestseries.testseriesId === testseriesId
    );

    if (!isEnrolled) {
      return res
        .status(400)
        .json({ error: "User is not enrolled in this testseries." });
    }

    for (let i = 0; i < user.testseriesEnrolled.length; i++) {
      if (user.testseriesEnrolled[i].testseriesId === testseriesId) {
        const startTimer = moment(
          user.testseriesEnrolled[i].starttimer,
          "MMMM Do YYYY, h:mm:ss a"
        );
        const currentTime = moment();
        const timeDifference = currentTime.diff(startTimer, "seconds");
        const timeAvailable = testseries.maxTime * 60 - timeDifference;
        console.log(timeAvailable);

        if (timeDifference > testseries.maxTime * 60) {
          return res
            .status(302)
            .json({ error: "Time expired", redirectToResults: true });
        } else {
          return res.status(200).json({
            testseries,
            timeAvailable,
          });
        }
      }
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.SubmitTest = async (req, res) => {
  const { testseriesId, email } = req.params;
  const { selectedOptions } = req.body;

  try {
    const testseries = await testseriesModel.findOne({ testseriesId });

    if (!testseries) {
      return res.status(404).json({ error: "Testseries not found" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Invalid User" });
    }

    const isEnrolled = user.testseriesEnrolled.some(
      (enrolledtestseries) => enrolledtestseries.testseriesId === testseriesId
    );

    if (!isEnrolled) {
      return res
        .status(400)
        .json({ error: "User is not enrolled in this testseries." });
    }

    var result = 0;

    selectedOptions.forEach((selectedOption, i) => {
      const question = testseries.questions[i];
      const correctOption = question.options.findIndex(
        ({ isCorrect }) => isCorrect
      );
      if (selectedOption == correctOption) result++;
    });
    user.testseriesEnrolled.forEach((enrolledtestseries) => {
      if (enrolledtestseries.testseriesId === testseriesId) {
        enrolledtestseries.result = result;
        enrolledtestseries.answers = selectedOptions;
      }
    });

    await user.save();

    return res.status(200).json({ result });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.CheckResult = async (req, res, next) => {
  const { testseriesId, email } = req.params;

  try {
    const testseries = await testseriesModel.findOne({ testseriesId });

    if (!testseries) {
      return res.status(404).json({ error: "Testseries not found" });
    }

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "Invalid User" });
    }

    const isEnrolled = user.testseriesEnrolled.some(
      (enrolledtestseries) => enrolledtestseries.testseriesId === testseriesId
    );

    if (!isEnrolled) {
      return res
        .status(400)
        .json({ error: "User is not enrolled in this testseries." });
    }

    for (let i = 0; i < user.testseriesEnrolled.length; i++) {
      if (user.testseriesEnrolled[i].testseriesId === testseriesId) {
        return res.status(200).json({
          result: user.testseriesEnrolled[i].result,
          selectedOptions: user.testseriesEnrolled[i].answers,
          testseries,
        });
      }
    }
  } catch (error) {
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

    let coursesEnrolled = [];
    let testseriesEnrolled = [];
    if (user.coursesEnrolled && user.coursesEnrolled.length > 0) {
      for (let i = 0; i < user.coursesEnrolled.length; i++) {
        const enrolledCourse = user.coursesEnrolled[i];
        if (enrolledCourse && enrolledCourse.courseId) {
          try {
            const course = await courseModel.findOne({
              courseId: enrolledCourse.courseId,
            });
            if (course) {
              let courseDetails = {
                courseName: course.courseName,
                thumbnail: course.thumbnail,
                courseId: course.courseId,
                currentlywatching: enrolledCourse.currentlywatching,
              };
              coursesEnrolled.push(courseDetails);
            } else {
              console.error(`Course not found: ${enrolledCourse.courseId}`);
            }
          } catch (error) {
            console.error(
              `Error finding course: ${enrolledCourse.courseId}`,
              error
            );
          }
        }
      }
    }
    if (user.testseriesEnrolled && user.testseriesEnrolled.length > 0) {
      for (let i = 0; i < user.testseriesEnrolled.length; i++) {
        const enrolledTestseries = user.testseriesEnrolled[i];
        if (enrolledTestseries && enrolledTestseries.testseriesId) {
          try {
            const testseries = await testseriesModel.findOne({
              testseriesId: enrolledTestseries.testseriesId,
            });
            if (testseries) {
              let testseriesDetails = {
                testseriesName: testseries.testseriesName,
                thumbnail: testseries.thumbnail,
                testseriesId: testseries.testseriesId,
              };
              testseriesEnrolled.push(testseriesDetails);
            }
          } catch (error) {
            console.error(
              `Error finding course: ${enrolledTestseries.testseriesId}`,
              error
            );
          }
        }
      }
    }
    let userDetails = {
      email: user.email,
      username: user.username,
      coursesEnrolled: coursesEnrolled,
      testseriesEnrolled: testseriesEnrolled,
    };
    res.status(200).json({ userDetails });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.SubmitFeedback = async (req, res, next) => {
  const { feedback, courseId, email } = req.body;

  try {
    const user = await userModel.findOne({ email });

    const currentlywatchingIndex = user.coursesEnrolled.findIndex(
      (enrolledCourse) => enrolledCourse.courseId === courseId
    );

    if (currentlywatchingIndex === -1) {
      return res
        .status(400)
        .json({ error: "User is not enrolled in this course." });
    }

    if (
      user.coursesEnrolled[currentlywatchingIndex].feedback &&
      user.coursesEnrolled[currentlywatchingIndex].feedback.rating > 0
    ) {
      return res
        .status(400)
        .json({ error: "Feedback already submitted for this course." });
    }

    const newReview = {
      rating: feedback.rating,
      comment: feedback.comment,
      reviewby: email,
      reviewdate: moment().add(10, "days").calendar(),
      reviewtime: moment().format("LT"),
    };
    user.coursesEnrolled[currentlywatchingIndex].feedback = newReview;

    await user.save();

    const updateduser = await userModel.findOne({ email });
    console.log(updateduser.coursesEnrolled);

    const course = await courseModel.findOne({ courseId });
    course.NumberOfRatings += 1;

    course.reviews.push(newReview);

    let totalRating = course.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    course.rating = totalRating / course.reviews.length;

    await course.save();

    res.status(200).json({
      feedback: user.coursesEnrolled[currentlywatchingIndex].feedback,
      currentlywatching:
        user.coursesEnrolled[currentlywatchingIndex].currentlywatching,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.ForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const resetToken = uuidv4();
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "ghattiganesh8@gmail.com",
        pass: "gecy jkfr fzmy dcwf",
      },
    });
    const mailOptions = {
      from: "ghattiganesh8@gmail.com",
      to: user.email,
      subject: "Password Reset",
      html:
        `<p>You are receiving this email because you (or someone else) has requested the reset of the password for your account.</p>` +
        `<p>Please click on the following link, or paste this into your browser to complete the process:</p>` +
        `<a href="http://localhost:5173/reset/${resetToken}">Click Here</a>` +
        `<p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.ResetPassword = async (req, res, next) => {
  try {
    const { resetPasswordToken } = req.params;
    const { email, password } = req.body;

    if (!validator.isStrongPassword(password)) {
      return res.status(400).json({
        error:
          "Weak password. Must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.",
      });
    }

    const user = await userModel.findOne({
      email: email,
      resetPasswordToken,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired " });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    user.password = hash;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = "";

    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};
