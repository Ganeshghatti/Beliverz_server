const adminModel = require("../../Model/Admin");
const instructorModel = require("../../Model/Instructor");
const courseModel = require("../../Model/Course");
const categoryModel = require("../../Model/Category");
const userModel = require("../../Model/User");
const formModel = require("../../Model/Form");
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

exports.AdminLogin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    if (!validator.isEmail(email)) {
      return res.status(400).json({
        message: "Internal server error",
        error: "enter a valid email",
      });
    }
    const admin = await adminModel.findOne({ email: email });

    if (!admin) {
      return res.status(401).json({
        message: "Internal server error",
        error: "wrong email or password",
      });
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
      return res.status(400).json({
        message: "Internal server error",
        error: "wrong email or password",
      });
    }

    const token = jwt.sign(
      { userId: admin._id, email: admin.email },
      process.env.ADMINJWTSECRET
    );

    res.status(200).json({
      email: admin.email,
      token: token,
      isAdmin: admin.isAdmin,
    });
  } catch (error) {
    sendErrorEmail(email, "Someone tried to Login to Admin Panel");
    res.status(500).json({
      message: "Internal server error",
      error: "Internal server error",
    });
  }
};

exports.CreateCourse = async (req, res, next) => {
  const {
    courseName,
    payment,
    amountInINR,
    courseDescription,
    level,
    tags,
    requirements,
    totalHours,
    categories,
    whatWillYouLearn,
    language,
    selectedCategories,
    selectedInstructors,
    instructors,
  } = req.body;

  try {
    const prefix = "CORS";
    const uniquePart = uuid.v4().replace(/-/g, "").substr(0, 6);
    const courseID = `${prefix}${uniquePart}`;

    const newCourse = new courseModel({
      courseName,
      courseId: courseID,
      payment,
      courseDescription,
      courseInfo: {
        level,
      },
      courseDetail: {
        tags,
        requirements,
        totalHours,
      },
      introVideo: "",
      thumbnail: "",
      courseCategory: categories,
      instructors: instructors,
      whatWillYouLearn,
      language,
      createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
      createdBy: req.admin.email,
    });
    if (payment === "paid") {
      newCourse.amountInINR = amountInINR;
    } else if (payment === "free") {
      newCourse.amountInINR = 0;
    }

    await newCourse.save();

    for (let i = 0; i < instructors.length; i++) {
      const filteredinstructors = await instructorModel.findOne({
        instructorId: instructors[i].instructorId,
      });
      if (filteredinstructors) {
        filteredinstructors.coursesAllowed.push({
          courseId: courseID,
          courseName: courseName,
        });

        await filteredinstructors.save();
      }
    }

    for (let i = 0; i < categories.length; i++) {
      const filteredcategories = await categoryModel.findOne({
        categoryId: categories[i].categoryId,
      });
      if (filteredcategories) {
        filteredcategories.courses.push({
          courseId: courseID,
          courseName: courseName,
        });

        await filteredcategories.save();
      }
    }

    res
      .status(201)
      .json({ message: "Course created successfully", course: newCourse });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.GetAllCourse = async (req, res, next) => {
  try {
    const allCourses = await courseModel.find();
    res.status(200).json({ courses: allCourses });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
exports.GetAllTestSeries = async (req, res, next) => {
  try {
    const allTestseries = await testseriesModel.find();
    res.status(200).json({ testseries: allTestseries });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
exports.CreateInstructor = async (req, res, next) => {
  const { name, email, password, courses, testseries } = req.body;
  try {
    const prefix = "INST";
    const uniquePart = uuid.v4().replace(/-/g, "").substr(0, 6);
    const instructorID = `${prefix}${uniquePart}`;

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const newInstructor = new instructorModel({
      instructorName: name,
      instructorId: instructorID,
      password: hash,
      email,
      coursesAllowed: courses,
      testseriesAllowed: testseries,
      createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
      createdBy: req.admin.email,
      isInstructor: true,
    });

    await newInstructor.save();
    for (let i = 0; i < courses.length; i++) {
      const filteredCourses = await courseModel.findOne({
        courseId: courses[i].courseId,
      });
      if (filteredCourses) {
        filteredCourses.instructors.push({
          instructorId: instructorID,
          instructorName: name,
          photo: "",
        });

        await filteredCourses.save();
      }
    }

    res.status(201).json({
      message: "Successfully Added the Instructor",
      instructor: newInstructor,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.GetAllInstructors = async (req, res, next) => {
  try {
    const allinstructors = await instructorModel.find();
    res.status(200).json({ instructors: allinstructors });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.GetAllCourseNames = async (req, res, next) => {
  try {
    const allcourses = await courseModel.find();

    const simplifiedCourses = allcourses.map((course) => ({
      courseName: course.courseName,
      courseId: course.courseId,
    }));

    res.status(200).json({ courses: simplifiedCourses });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
exports.GetAllTestseriesNames = async (req, res, next) => {
  try {
    const alltestseries = await testseriesModel.find();

    const simplifiedTestseries = alltestseries.map((testseries) => ({
      testseriesName: testseries.testseriesName,
      testseriesId: testseries.testseriesId,
    }));

    res.status(200).json({ testseries: simplifiedTestseries });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
exports.GetAllCategory = async (req, res, next) => {
  try {
    const allCategory = await categoryModel.find();
    res.status(200).json({ category: allCategory });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.EditCategory = async (req, res, next) => {
  const { categories } = req.body;
  console.log(req.body);
  try {
    for (const categoryUpdate of categories) {
      const { categoryId, courses, categoryImg, categoryName } = categoryUpdate;
      const category = await categoryModel.findOne({ categoryId });
      console.log(category);

      if (!category) {
        return res
          .status(404)
          .json({ error: `Category with ID ${categoryId} not found` });
      }
      category.categoryImg = categoryImg;
      category.categoryName = categoryName;
      category.courses = courses;
      await category.save();
    }

    res
      .status(200)
      .json({ msg: `Courses updated successfully for all categories` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.EditInstructor = async (req, res, next) => {
  const { instructorId } = req.params;
  console.log(req.body.courses, req.body.testseries);
  try {
    const instructor = await instructorModel.findOne({ instructorId });

    if (!instructor) {
      return res
        .status(404)
        .json({ error: `Instructor with ID ${instructorId} not found` });
    }
    instructor.coursesAllowed = req.body.courses;
    instructor.testseriesAllowed = req.body.testseries;
    instructor.testseriesAllowedTest = req.body.testseries;

    instructor.lastUpdate = moment().format("MMMM Do YYYY, h:mm:ss a");
    await instructor.save();
    const instructorafterupdate = await instructorModel.findOne({
      instructorId,
    });
    console.log(instructorafterupdate);
    res.status(200).json({ msg: `Instructor updated successfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.DeleteInstructor = async (req, res, next) => {
  const { instructorId } = req.params;

  try {
    const deletedInstructor = await instructorModel.findOneAndDelete(
      instructorId
    );

    if (!deletedInstructor) {
      return res
        .status(404)
        .json({ error: `Instructor with ID ${instructorId} not found` });
    }
    console.log(deletedInstructor);
    res.status(200).json({
      message: "Instructor deleted successfully",
      instructor: deletedInstructor,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.ChangePassword = async (req, res, next) => {
  console.log(req.body);

  const { formData, email } = req.body;
  try {
    const admin = await adminModel.findOne({ email });

    const match = await bcrypt.compare(formData.oldpassword, admin.password);
    if (!match) {
      return res.status(400).json({
        error: "Wrong password",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(formData.password, salt);

    admin.password = hash;

    await admin.save();
    sendErrorEmail(email, "Admin Password changed");

    res.status(200).json({
      msg: "Password change successful",
    });
  } catch (error) {
    sendErrorEmail(email, "Someone tried to Change Admin Password");
    res.status(500).json({ error: "Failed to change password" });
  }
};

exports.GetFormData = async (req, res, next) => {
  try {
    const formData = await formModel.find();
    res.status(200).json({ formData: formData });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.GetAllUsers = async (req, res, next) => {
  try {
    const allusers = await userModel.find();
    res.status(200).json({ users: allusers });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

exports.CreateTestSeries = async (req, res, next) => {
  const {
    testseriesName,
    payment,
    amountInINR,
    testseriesDescription,
    testInstructions,
    selectedInstructors,
    maxTime,
    instructors,
  } = req.body;

  try {
    const prefix = "TEST";
    const uniquePart = uuid.v4().replace(/-/g, "").substr(0, 6);
    const testseriesId = `${prefix}${uniquePart}`;

    const newTestSeries = new testseriesModel({
      testseriesName,
      testseriesId,
      payment,
      maxTime: maxTime,
      TestSeriesDescription: testseriesDescription,
      thumbnail: "",
      totalEnrollments: 0,
      instructors,
      testInstructions,
      createdAt: moment().format("MMMM Do YYYY, h:mm:ss a"),
      createdBy: req.admin.email,
    });
    if (payment === "paid") {
      newTestSeries.amountInINR = amountInINR;
    } else if (payment === "free") {
      newTestSeries.amountInINR = 0;
    }

    await newTestSeries.save();

    for (let i = 0; i < instructors.length; i++) {
      const filteredinstructors = await instructorModel.findOne({
        instructorId: instructors[i].instructorId,
      });
      if (filteredinstructors) {
        filteredinstructors.testseriesAllowed.push({
          testseriesId: testseriesId,
          testseriesName: testseriesName,
        });

        await filteredinstructors.save();
      }
    }

    res.status(201).json({
      message: "Test Series created successfully",
      testseries: newTestSeries,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

// const createCategory = async () => {
//   try {
//     const prefix = "CATE";
//     const uniquePart = uuid.v4().replace(/-/g, "").substr(0, 6);
//     const categoryId = `${prefix}${uniquePart}`;
//     const category = new categoryModel({
//       categoryName: "Category4",
//       categoryId: categoryId,
//       categoryImg: "abcd",
//     });
//     const savedCategory = await category.save();
//     console.log(savedCategory);
//   } catch (error) {
//     console.error(error);
//   }
// };

// const createAdmin = async () => {
//   const email = "admin@beliverz.com";
//   const password = "admin";
// const salt = await bcrypt.genSalt(10);
// const hash = await bcrypt.hash(password, salt);

//   const admin = new adminModel({
//     email: email,
//     password: hash,
//     isAdmin: true,
//   });

//   const newadmin = await admin.save();
//   console.log(newadmin);
// };

// createAdmin();
