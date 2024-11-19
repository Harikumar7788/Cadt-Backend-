const mongoose = require('mongoose');

const GLBModelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  glbUrl: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const GLBModel = mongoose.model('GLBModel', GLBModelSchema);
module.exports = GLBModel;
