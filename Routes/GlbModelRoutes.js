const express = require('express');
const router = express.Router();
const glbController = require('../Controllers/GlbModelController'); 
const multer = require('multer');
 

const upload = multer();

router.post('/glbloaders', upload.single('glbModel'), glbController.uploadGLBModel);
router.get('/getglbloaders', glbController.getGLBModels);
router.put('/updateglbloaders/:id', upload.single('glbModel'), glbController.updateGLBModel);
router.delete('/deleteglbloaders/:id', glbController.deleteGLBModel);

module.exports = router;
