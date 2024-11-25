const mongoose = require('mongoose');

const furnitureSchema = new mongoose.Schema({
    modelType: String,
    category: String,  
    FurnituresImagesArraywithGltf: [
      {
        furnitureName: String,
        furnitureImage: String,       
        furnitureGltfLoader: String,  
      },
    ],
  });
  
const Furniture = mongoose.model('Furniture', furnitureSchema);

module.exports = Furniture