// routes/textureRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const textureController = require('../Controllers/TextureController');

const upload = multer(); 

router.post('/textures',  upload.fields([{ name: 'Texturesfiles' }]),textureController.createTexture);

router.get('/getTextures', textureController.getTextures);

router.put('/edittextures/:id', upload.fields([{ name: 'Texturesfiles' }]),textureController.updateTexture);

router.delete('/deletetextures/:id', textureController.deleteTexture);

module.exports = router;
