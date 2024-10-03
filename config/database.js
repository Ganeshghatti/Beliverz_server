const mongoose = require("mongoose");

const connectdatabase = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://beliverzjrf:QPun5u5mY2nm0ocT@beliverz.gbxr6.mongodb.net/?retryWrites=true&w=majority&appName=beliverz"
    );
    console.log("config connected");
  } catch (error) {
    console.log("config Failed" + error.message, error);
  }
};
module.exports = connectdatabase;
