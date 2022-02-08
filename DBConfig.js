const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Getting access to env variables.
dotenv.config({ path: './config.env' });

const databaseConnection = async () => {
  try {
    await mongoose.connect(process.env.DATABASE, {});
    console.log('DB Connection successful');
  } catch (error) {
    console.log(error);
  }
};

module.exports = databaseConnection;
