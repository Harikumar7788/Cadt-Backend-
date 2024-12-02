const Model = require("../Schema/glb");
const cloudinary = require("cloudinary").v2;
const fs = require("fs");




exports.getModels = async (req, res) => {
  try {
    const models = await Model.find();
    res.status(200).json(models);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch models", details: err.message });
  }
};


exports.getModelById = async (req, res) => {
  try {
    const model = await Model.findById(req.params.id);
    if (!model) return res.status(404).json({ error: "Model not found" });
    res.status(200).json(model);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch model", details: err.message });
  }
};


exports.uploadModel = async (req, res) => {
  try {
    const { category, modelType } = req.body;
    console.log("Uploaded value ", category, modelType)

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "auto", 
      folder: "models",     
    });

   
    fs.unlinkSync(req.file.path);


    const newModel = new Model({
      category,
      modelType,
      filePath: cloudinaryResponse.secure_url, 
    });

    await newModel.save();
    res.status(201).json({ message: "Model uploaded successfully", model: newModel });
  } catch (err) {
    res.status(500).json({ error: "Failed to upload model", details: err.message });
  }
};

exports.updateModel = async (req, res) => {
  try {
    const { id } = req.params;
    const { category, modelType } = req.body;

    console.log("Request Body:", req.body);  
    console.log("File Uploaded:", req.file ? req.file.path : "No file uploaded");

    const model = await Model.findById(id);
    if (!model) {
      return res.status(404).json({ error: "Model not found" });
    }


    if (req.file) {
    
      if (model.filePath) {
        const publicId = model.filePath.split("/").pop().split(".")[0]; 
        await cloudinary.uploader.destroy(`models/${publicId}`);
      }

      const cloudinaryResponse = await cloudinary.uploader.upload(req.file.path, {
        resource_type: "auto",
        folder: "models",
      });

      if (!cloudinaryResponse || !cloudinaryResponse.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      model.filePath = cloudinaryResponse.secure_url;
      fs.unlinkSync(req.file.path); // Delete the temporary file from local storage
    }

    // Update other fields
    model.category = category || model.category;
    model.modelType = modelType || model.modelType;

    // Save the updated model
    const updatedModel = await model.save();
    console.log("Model updated successfully:", updatedModel);

    res.status(200).json({ message: "Model updated successfully", model: updatedModel });
  } catch (err) {
    console.error("Error updating model:", err);
    res.status(500).json({ error: "Failed to update model", details: err.message });
  }
};



// Delete a model
exports.deleteModel = async (req, res) => {
  try {
    const { id } = req.params;

    const model = await Model.findById(id);
    if (!model) return res.status(404).json({ error: "Model not found" });

  
    const publicId = model.filePath.split("/").pop().split(".")[0];
    await cloudinary.uploader.destroy(`models/${publicId}`);

  
    await model.remove();
    res.status(200).json({ message: "Model deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete model", details: err.message });
  }
};
