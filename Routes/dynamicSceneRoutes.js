const express = require('express');
const Authentication = require("../Utilis/Authication");
const router = express.Router();
const { 
  createDynamicScene, 
  getUserSpecificData, 
  updateDynamicScene, 
  deleteDynamicScene, 
  getAllDynamicScenes 
} = require('../Controllers/dynamicSceneController');

router.post('/dynamicscene', createDynamicScene);


router.get('/dynamicscene/:username', getUserSpecificData);


router.put('/dynamicscene/:projectName/edit', updateDynamicScene);


router.delete('/dynamicscene', deleteDynamicScene);

// By Admin - Get all dynamic scenes
router.get('/getdynamicscene', getAllDynamicScenes);

module.exports = router;
