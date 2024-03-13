const mongoose = require("mongoose");

const connectdatabase = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://ganeshghatti6:bba9gXnE2rCfZRRl@beliverz.hebeekj.mongodb.net/?retryWrites=true&w=majority"
    );
    console.log("config connected");
    
  } catch (error) {
    console.log("config Failed" + error.message, error);
  }
};
module.exports = connectdatabase;
