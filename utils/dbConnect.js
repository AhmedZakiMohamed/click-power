const mongoose = require("mongoose");
const config  = require("../config");
const AppError = require("./appError");


const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log("Database connected");
  } catch (err) {
    throw new AppError("Database connection failed", 500);
  }
};
module.exports = connectDB;
