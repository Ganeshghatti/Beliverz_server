const express = require("express");
const connectdatabase = require("./config/database");
const cors = require("cors");
const bodyParser = require("body-parser");
const userroutes = require("./User/routes/User");
const adminroutes = require("./Admin/routes/Admin");
const instructorroutes = require("./Admin/routes/Instructor");
const courseroutes = require("./Admin/routes/Course");
const testSeriesroutes = require("./Admin/routes/TestSeries");
const dotenv = require("dotenv");
const path = require("path");
const mongoose = require("mongoose");
const userModel = require("./Model/User");

dotenv.config({ path: path.join(__dirname, "api", ".env") });
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(adminroutes);
app.use(userroutes);
app.use(instructorroutes);
app.use(courseroutes);
app.use(testSeriesroutes);

connectdatabase();

module.exports = app;
