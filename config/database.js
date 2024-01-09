const mongoose = require("mongoose");

const connectdatabase = async () => {
  try {
    // await mongoose.connect(process.env.MONGODB_CONNECT_URI);
    await mongoose.connect("mongodb+srv://ganeshghatti6:bba9gXnE2rCfZRRl@beliverz.hebeekj.mongodb.net/?retryWrites=true&w=majority");
    console.log("connected")
  } catch (error) {
    console.log("Failed" + error.message);
  }
};
module.exports = connectdatabase;
