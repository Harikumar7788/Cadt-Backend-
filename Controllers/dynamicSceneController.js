// /Controllers/dynamicSceneController.js

const MainArrayModel = require('../Schema/DynamicScene');
const mongoose = require("mongoose")


const getUserSpecificModel = (collectionName) => {
  return mongoose.models[collectionName] || 
    mongoose.model(collectionName, new mongoose.Schema({
      projectName: String,
      coordinates: Array,
      gltfObjects: Array,
      createdAt: { type: Date, default: Date.now },
    }));
};

// Create dynamic scene data
const createDynamicScene = async (req, res) => {
  try {
    const { projectName, coordinates, gltfObjects, username, imageUrl } = req.body;
    console.log("Save Project Details", projectName , coordinates, gltfObjects, username,imageUrl)

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const newDocument = new MainArrayModel({ projectName, coordinates, gltfObjects, imageUrl });
    const savedDocument = await newDocument.save();

    const userSpecificModel = getUserSpecificModel(`user_${username}_datas`);
    const userSpecificDocument = new userSpecificModel({ projectName, coordinates, gltfObjects, imageUrl });
    await userSpecificDocument.save();

    res.status(201).json({
      message: 'Data successfully added to both global and user-specific collections',
      globalData: savedDocument,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error adding data',
      error: error.message,
    });
  }
};

// Get user-specific dynamic scene data
const getUserSpecificData = async (req, res) => {
  try {
    const { username } = req.params;


    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }


    const userSpecificModel = getUserSpecificModel(`user_${username}_datas`);
    const userSpecificData = await userSpecificModel.find();

    if (!userSpecificData.length) {
      return res.status(404).json({ message: 'No data found for the user' });
    }

    res.status(200).json({
      message: `Data retrieved successfully for user: ${username}`,
      data: userSpecificData,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error retrieving data',
      error: error.message,
    });
  }
};

// Update dynamic scene data
const updateDynamicScene = async (req, res) => {
  try {
    const { username, gltfLink, updatedCoordinates, updatedGltfLink, updatedGltfScene } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }

    const globalDocument = await MainArrayModel.findOne();
    if (globalDocument) {
      if (updatedCoordinates) {
        globalDocument.coordinates = updatedCoordinates;
      }

      const gltfObject = globalDocument.gltfObjects.find(obj => obj.gltfLink === gltfLink);
      if (gltfObject) {
        gltfObject.gltfLink = updatedGltfLink || gltfObject.gltfLink;
        gltfObject.gltfScene = updatedGltfScene || gltfObject.gltfScene;
      }

      await globalDocument.save();
    } else {
      return res.status(404).json({ message: 'Global document not found' });
    }

    const userSpecificModel = getUserSpecificModel(`user_${username}_datas`);
    const userDocument = await userSpecificModel.findOne();
    if (userDocument) {
      if (updatedCoordinates) {
        userDocument.coordinates = updatedCoordinates;
      }

      const userGltfObject = userDocument.gltfObjects.find(obj => obj.gltfLink === gltfLink);
      if (userGltfObject) {
        userGltfObject.gltfLink = updatedGltfLink || userGltfObject.gltfLink;
        userGltfObject.gltfScene = updatedGltfScene || userGltfObject.gltfScene;
      }

      await userDocument.save();
    } else {
      return res.status(404).json({ message: `User document not found for username: ${username}` });
    }

    res.status(200).json({
      message: 'Data successfully updated in both global and user-specific collections',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error updating data',
      error: error.message,
    });
  }
};


const deleteDynamicScene = async (req, res) => {
  try {
    const { projectName, username } = req.body;

    if (!username) {
      return res.status(400).json({ message: 'Username is required' });
    }
    if (!projectName) {
      return res.status(400).json({ message: 'Project name is required' });
    }

    let deleteResult;

    if (username === 'Admin') {
    
      deleteResult = await MainArrayModel.findOneAndDelete({ projectName });

      if (!deleteResult) {
        return res.status(404).json({ message: 'No matching data found in mainarrays to delete' });
      }
    } else {
      
      const userSpecificModel = getUserSpecificModel(`user_${username}_datas`);
      deleteResult = await userSpecificModel.findOneAndDelete({ projectName });

      if (!deleteResult) {
        return res.status(404).json({ message: 'No matching data found to delete in user-specific collection' });
      }
    }

    res.status(200).json({
      message: 'Data successfully deleted',
      deletedData: deleteResult,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: 'Error deleting data',
      error: error.message,
    });
  }
};




// Get all dynamic scene data (Admin only)
const getAllDynamicScenes = async (req, res) => {
  try {
    const document = await MainArrayModel.find();
    res.status(200).json(document);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve data', message: error.message });
  }
};

module.exports = {
  createDynamicScene,
  getUserSpecificData,
  updateDynamicScene,
  deleteDynamicScene,
  getAllDynamicScenes
};
