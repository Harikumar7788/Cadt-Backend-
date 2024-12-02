const mongoose = require("mongoose");

const GlbModelSchema = new mongoose.Schema({
  category: { type: String, required: true },
  modelType: { type: String, required: true },
  filePath: { type: String, required: true }, 
  imagePath: { type: String }, 
});

module.exports = mongoose.model("GlbModel", GlbModelSchema);
