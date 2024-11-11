const mongoose = require('mongoose');

// Define schema for individual coordinates within mainArray
const CoordinateSchema = new mongoose.Schema({
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  z: { type: Number, required: true }
}, { _id: false });

// Define schema for mainArray item
const MainArrayItemSchema = new mongoose.Schema({
  coordinates: [CoordinateSchema], // Array of coordinates
  gltfLink: { type: String, required: true }, // URL for GLTF file
  gltfScene: CoordinateSchema // Position of GLTF scene as x, y, z
}, { _id: false });

// Define schema for the full main array document
const MainArraySchema = new mongoose.Schema({
  mainArray: [MainArrayItemSchema] // List of items with coordinates, gltfLink, and gltfScene
}, { timestamps: true });

const MainArrayModel = mongoose.model('MainArray', MainArraySchema);

module.exports = MainArrayModel;
