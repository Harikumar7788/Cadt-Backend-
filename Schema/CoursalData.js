const mongoose = require('mongoose');

const coursalSchema = new mongoose.Schema({
  heading: { type: String, required: true },
  description: { type: String, required: true },
  button: { type: String, required: true },
  imageUrl: { type: String, required: true },  
});

const Coursal = mongoose.model('Coursal', coursalSchema);

module.exports = Coursal;
