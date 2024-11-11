const mongoose = require('mongoose');


const CoordinateSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  z: { type: Number, required: true }
}, { _id: false });

const GltfObjectSchema = new mongoose.Schema({
  gltfLink: { type: String, required: true },
  gltfScene: {
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    z: { type: Number, required: true }
  }
}, { _id: false });


const MainArraySchema = new mongoose.Schema({
  coordinates: {
    type: [[CoordinateSchema]],
    required: true
  },
  gltfObjects: {
    type: [GltfObjectSchema], 
    required: true
  }
}, { timestamps: true });

const MainArrayModel = mongoose.model('MainArray', MainArraySchema);

module.exports = MainArrayModel;
