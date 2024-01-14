const mongoose = require("mongoose");

const formSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  query: String,
  date: String,
  time: String,
});

const Form = mongoose.model("Form", formSchema);

module.exports = Form;
