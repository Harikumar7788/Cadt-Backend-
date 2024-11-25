const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;

const addFurniture = async (req, res) => {
  try {
    const { name: username } = req.user || {};
    if (!username) {
      return res.status(400).json({ error: "Invalid user" });
    }

    const userCollectionName = `user_${username}_data`;

    if (
      !req.files ||
      !req.files.furnitureGltfLoaderFiles ||
      req.files.furnitureGltfLoaderFiles.length === 0
    ) {
      return res.status(400).json({ message: "No GLTF files uploaded" });
    }

    const { modelType, category, FurnituresImagesArraywithGltf } = req.body.data
      ? JSON.parse(req.body.data)
      : {};

    if (!modelType || !category || !FurnituresImagesArraywithGltf) {
      return res.status(400).json({ message: "Invalid data format" });
    }

    const processedFurnitures = await Promise.all(
      FurnituresImagesArraywithGltf.map(async (item, index) => {
        const gltfFileContent = req.files.furnitureGltfLoaderFiles[index].buffer;
        const imageFileContent = req.files.furnitureImageFiles[index].buffer;

        const gltfFileName = `${Date.now()}-${req.files.furnitureGltfLoaderFiles[index].originalname}`;
        const imageFileName = `${Date.now()}-${req.files.furnitureImageFiles[index].originalname}`;

        // Upload GLTF to Cloudinary
        const glbResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "raw", public_id: gltfFileName },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(gltfFileContent);
        });

        // Upload Image to Cloudinary
        const imageResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: "image", public_id: imageFileName },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(imageFileContent);
        });

        return {
          furnitureName: item.furnitureName,
          furnitureImage: imageResponse.secure_url,
          furnitureGltfLoader: glbResponse.secure_url,
        };
      })
    );

    // Dynamically create or use user collection
    const UserCollection =
      mongoose.models[userCollectionName] ||
      mongoose.model(userCollectionName, require("../Schema/Furniture"));

    const newFurnitureData = new UserCollection({
      modelType,
      category,
      FurnituresImagesArraywithGltf: processedFurnitures,
    });

    const savedFurniture = await newFurnitureData.save();

    res.status(201).json({
      message: "Furniture saved successfully",
      data: savedFurniture,
    });
  } catch (error) {
    console.error("Error saving furniture data:", error);
    res.status(500).json({ message: "Error saving furniture data", error });
  }
};

// GET: Retrieve Common Furniture
const getFurnitures = async (req, res) => {
  try {
    const furnitures = await require("../Schema/Furniture").find({});
    res.status(200).json(furnitures);
  } catch (error) {
    console.error("Error retrieving furniture data:", error);
    res.status(500).json({ message: "Error retrieving furniture data", error });
  }
};

module.exports = {
  addFurniture,
  getFurnitures,
};
