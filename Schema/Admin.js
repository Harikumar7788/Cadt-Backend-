
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    role:String
  });
  const Admin = mongoose.model('Admin', userSchema);
  
  module.exports = Admin;