require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require("cors");
const multer = require('multer');
const cloudinary = require('./Utilis/cloudinary');
const authenticateToken = require('./Utilis/Authication');
const MainArrayModel = require('./Schema/DynamicScene')
const Texture = require("./Schema/texture")
const GLBModel = require('./Schema/glb');
const Coursal = require("./Schema/CoursalData")

const streamifier = require("streamifier");
const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const uri = process.env.MONGODB_URI;
mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => console.log("MongoDB Connected"))
   .catch(err => console.log("MongoDB Connection Error:", err));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

const upload1 = multer({ dest: 'uploads/' });

const authRoutes = require("./Routes/authrouter")
const DynamicScene = require("./Routes/dynamicSceneRoutes")
const sceneRoutes = require("./Routes/DefaultSceneRoutes")
const textureRoutes = require("./Routes/TexturesRoutes")
const glbRoutes = require("./Routes/GlbModelRoutes")
const coursalData = require("./Routes/CoursalDataRoutes")
const Furniture = require("./Routes/FurnitureRoute")

app.use('/auth', authRoutes);
app.use("/dynamic",DynamicScene)
app.use('/default', sceneRoutes);
app.use('/texture', textureRoutes);
app.use("/glb",glbRoutes);
app.use("/coursal",coursalData);
app.use("/furniture", Furniture);

// Start Server
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
