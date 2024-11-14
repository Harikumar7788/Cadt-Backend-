const mongoose = require('mongoose');

const textureSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  textures: [
    {
      url: {
        type: String,
        required: true,
      }
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Texture', textureSchema);
