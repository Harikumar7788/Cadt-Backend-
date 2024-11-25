const GLBModel = require('../Schema/glb'); 
const cloudinary = require('cloudinary').v2;

exports.uploadGLBModel = async (req, res) => {
  try {
    const { category, modelType } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const uploadResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'auto', folder: 'glb_models/' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const glbUrl = uploadResponse.secure_url;
    const newGLBModel = new GLBModel({ modelType, category, glbUrl });
    const savedModel = await newGLBModel.save();

    res.status(201).json({
      message: 'GLB model uploaded successfully',
      data: savedModel,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to upload GLB model',
      error: error.message,
    });
  }
};

exports.getGLBModels = async (req, res) => {
  try {
    const models = await GLBModel.find();
    res.status(200).json({
      message: 'GLB models retrieved successfully',
      data: models,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to retrieve GLB models',
      error: error.message,
    });
  }
};

exports.updateGLBModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, modelType } = req.body;

    const glbModel = await GLBModel.findById(id);
    if (!glbModel) {
      return res.status(404).json({ message: 'GLB model not found' });
    }

    if (req.file) {
      const uploadResponse = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'glb_models/' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      glbModel.glbUrl = uploadResponse.secure_url;
    }

    if (category) glbModel.category = category;
    if (modelType) glbModel.modelType = modelType;

    const updatedModel = await glbModel.save();

    res.status(200).json({
      message: 'GLB model updated successfully',
      data: updatedModel,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update GLB model',
      error: error.message,
    });
  }
};

exports.deleteGLBModel = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedModel = await GLBModel.findByIdAndDelete(id);
    if (!deletedModel) {
      return res.status(404).json({ message: 'GLB model not found' });
    }

    res.status(200).json({
      message: 'GLB model deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete GLB model',
      error: error.message,
    });
  }
};
