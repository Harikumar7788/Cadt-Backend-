
const Texture = require('../Schema/texture');
const cloudinary = require('cloudinary').v2;


const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: "textures" },
      (error, result) => {
        if (error) {
          reject(new Error("Cloudinary upload failed"));
        } else {
          resolve(result);
        }
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// POST: Upload textures
const createTexture = async (req, res) => {
  try {
    if (!req.files || !req.files.Texturesfiles || req.files.Texturesfiles.length === 0) {
      return res.status(400).send("No files selected");
    }

    const { name, type } = req.body;
    if (!name || !type) {
      return res.status(400).send("Invalid Data Format");
    }

    const uploadedTextures = await Promise.all(
      req.files.Texturesfiles.map(async (file) => {
        const result = await uploadToCloudinary(file.buffer);
        return { url: result.secure_url };
      })
    );

    const textureData = new Texture({
      name,
      type,
      textures: uploadedTextures,
    });

    await textureData.save();

    res.status(200).json({
      message: "Textures uploaded and saved successfully",
      data: textureData,
    });
  } catch (e) {
    console.error("Error uploading texture:", e);
    res.status(500).send("Server Error");
  }
};

// GET: Retrieve all textures
const getTextures = async (req, res) => {
  try {
    const textures = await Texture.find();
    res.status(200).send(textures);
  } catch (e) {
    console.error("Error retrieving textures:", e);
    res.status(500).send("Server Error");
  }
};

// PUT: Update a texture by ID
const updateTexture = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type } = req.body;

    if (!name && !type && (!req.files || !req.files.Texturesfiles)) {
      return res.status(400).send("No data provided for update");
    }

    const texture = await Texture.findById(id);
    if (!texture) {
      return res.status(404).send("Texture not found");
    }

    let updatedTextures = texture.textures;
    if (req.files && req.files.Texturesfiles) {
      const newTextures = await Promise.all(
        req.files.Texturesfiles.map(async (file) => {
          const result = await uploadToCloudinary(file.buffer);
          return { url: result.secure_url };
        })
      );
      updatedTextures = [...updatedTextures, ...newTextures];
    }

    if (name) texture.name = name;
    if (type) texture.type = type;
    texture.textures = updatedTextures;

    const updatedTexture = await texture.save();

    res.status(200).json({
      message: "Texture updated successfully",
      data: updatedTexture,
    });
  } catch (e) {
    console.error("Error updating texture:", e);
    res.status(500).send("Server Error");
  }
};

// DELETE: Remove a texture by ID
const deleteTexture = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTexture = await Textre.findByIdAndDelete(id);
    if (!deletedTexture) {
      return res.status(404).send("Texture not found");
    }

    res.status(200).json({
      message: "Texture deleted successfully",
    });
  } catch (e) {
    console.error("Error deleting texture:", e);
    res.status(500).send("Server Error");
  }
};

module.exports = {
  createTexture,
  getTextures,
  updateTexture,
  deleteTexture,
};
