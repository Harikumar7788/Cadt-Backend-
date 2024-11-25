
const SceneValue = require('../Schema/DefaultScene'); 


const createDefaultScene = async (req, res) => {
  try {
    const data = req.body.data;
    if (!Array.isArray(data)) {
      return res.status(400).json({ message: 'Data should be an array of objects' });
    }

    const formattedData = [
      {
        name: "Lcut",  
        cordinates: data
      }
    ];

    await SceneValue.insertMany(formattedData);
    res.status(200).json({ message: 'Data stored successfully in sceneValue collection' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error storing data' });
  }
};


const getDefaultScenes = async (req, res) => {
  try {
    const data = await SceneValue.find();
    res.status(200).json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error retrieving data' });
  }
};

module.exports = {
  createDefaultScene,
  getDefaultScenes
};
