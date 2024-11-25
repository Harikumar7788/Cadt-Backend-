const express = require('express');
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

router.put('/dynamicscene/edit', updateDynamicScene);


router.delete('/dynamicscene', deleteDynamicScene);
// By Admin 
router.get('/getdynamicscene', getAllDynamicScenes);

module.exports = router;
