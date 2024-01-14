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
  console.log(req.params);
  const { courseId } = req.params.id;
  console.log(courseId);
  try {
    const course = await instructorModel.findOne({ courseId });

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
