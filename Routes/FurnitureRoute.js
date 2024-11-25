const express = require("express");
const multer = require("multer");
const { addFurniture, getFurnitures } = require("../Controllers/FurnitureController");
const authenticateToken = require("../Utilis/Authication");

const router = express.Router();
const upload = multer();

// Routes
router.post(
  "/furnitures",
  upload.fields([
    { name: "furnitureGltfLoaderFiles" },
    { name: "furnitureImageFiles" },
  ]),
  addFurniture
);

router.get("/getfurnitures", getFurnitures);

module.exports = router;
