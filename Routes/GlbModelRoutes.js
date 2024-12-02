// routes/models.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

const {
  getModels,
  getModelById,
  uploadModel,
  updateModel,
  deleteModel,
} = require("../Controllers/GlbModelController");

router.get("/getglbloaders", getModels);
router.get("/:id", getModelById);
router.post("/glbloaders", upload.single("file"), uploadModel);
router.put("/updateglb/:id", upload.single("file"), updateModel);
router.delete("/:id", deleteModel);

module.exports = router;
