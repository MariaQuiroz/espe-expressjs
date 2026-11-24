const mongoose = require("mongoose");

const connectMongo = async () => {
  await mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000,
  });
  console.log("MongoDB conectado");
};

module.exports = connectMongo;
