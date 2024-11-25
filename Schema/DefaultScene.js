
const mongoose = require('mongoose');
const sceneValueSchema = new mongoose.Schema({
    name: String,
    cordinates: [ 
      {
        x: Number,
        y: Number,
        z: Number
      }
    ]
  });
  
  const SceneValue = mongoose.model('SceneValue', sceneValueSchema);
  module.exports = SceneValue;
