const express = require("express");
const connectdatabase = require("../config/database");
const cors = require("cors");
const bodyParser = require("body-parser");
const adminroutes = require("./src/routes/Admin");
const courseroutes= require("./src/routes/Course")
const instructorroutes=require("./src/routes/Instructor")
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, 'api', '.env') });
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());

// app.use(courseroutes)
app.use(instructorroutes);
app.use(adminroutes);

connectdatabase();

module.exports = app;
