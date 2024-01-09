const express = require("express");
const connectdatabase = require("../config/database");
const cors = require("cors");
const bodyParser = require("body-parser");
const userroutes = require("./src/routes/User");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(bodyParser.json());
app.use(cors());
app.use(userroutes);

connectdatabase();

module.exports = app;
