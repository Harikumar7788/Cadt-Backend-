const express = require("express");
const multer = require("multer");
const { postCoursalData, getCoursalData } = require("../Controllers/coursalDataController");

const router = express.Router();
const upload = multer();


router.post("/postCoursalData", upload.single("image"), postCoursalData);
router.get("/getCoursalData", getCoursalData);

module.exports = router;
