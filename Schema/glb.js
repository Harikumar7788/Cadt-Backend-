const mongoose = require("mongoose");

const GlbModelSchema = new mongoose.Schema({
  category: { type: String, required: true },
  modelType: { type: String, required: true },
  filePath: { type: String, required: true }, 
  variant: { type: String, required: false },  
});

module.exports = mongoose.model("GlbModel", GlbModelSchema);
