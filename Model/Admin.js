const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    immutable: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,  // Specify the schema type as Boolean
    default: true,
    immutable: true,
  },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
