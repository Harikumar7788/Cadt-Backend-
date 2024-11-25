
const express = require('express');
const router = express.Router();
const sceneController = require('../Controllers/defaultSceneController');


router.post('/defaultscene', sceneController.createDefaultScene);

router.get('/getdefaultscene', sceneController.getDefaultScenes);

module.exports = router;


