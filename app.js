require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require("cors");
const multer = require('multer');
const cloudinary = require('./cloudinary');


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

// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const Admins = mongoose.model('Clients', userSchema);

// Furniture Schema
const furnitureSchema = new mongoose.Schema({
  modelType: String,
  FurnituresImagesArraywithGltf: [
    {
      furnitureName: String,
      furnitureImage: String,       
      furnitureGltfLoader: String,  
    },
  ],
});

const Furniture = mongoose.model('Furniture', furnitureSchema);

// Login API
app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const dbResponse = await Admins.findOne({ username });
    if (!dbResponse) {
      return res.status(400).json({ error: "Invalid user" });
    }
    if (password !== dbResponse.password) {
      return res.status(401).json({ error: "Invalid password" });
    }
    const user = { name: username, auth: "user", tokenmode: "notadmin" };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN);
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).send("Server Error!");
  }
});

// Register API
app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const dbResponse = await Admins.findOne({ username });
    if (dbResponse) {
      return res.status(400).json({ error: "User Already Registered" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be greater than six characters" });
    }
    const user = { name: username };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN);
    const newUser = new Admins({ username, password });
    await newUser.save();
    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).send("Server Error!");
  }
});

// Get Users
app.get("/users", async (req, res) => {
  try {
    const users = await Admins.find({});
    res.send(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).send("Server Error!");
  }
});

// Post Furniture
app.post('/furnitures', upload.array('furnitureGltfLoaderFiles'), async (request, response) => {
  try {
    if (!request.files || request.files.length === 0) {
      return response.status(400).json({ message: 'No files uploaded' });
    }

    const { modelType, FurnituresImagesArraywithGltf } = request.body.data
      ? JSON.parse(request.body.data)
      : {};

    if (!modelType || !FurnituresImagesArraywithGltf) {
      return response.status(400).json({ message: 'Invalid data format' });
    }

    const processedFurnitures = await Promise.all(
      FurnituresImagesArraywithGltf.map(async (item, index) => {
        const fileContent = request.files[index].buffer;
        const fileName = `${Date.now()}-${request.files[index].originalname}`;

        const glbResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'raw', public_id: fileName },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(fileContent);
        });

        const imageResponse = await cloudinary.uploader.upload(item.furnitureImage, {
          resource_type: 'image',
          public_id: `${fileName}-image`,
        });

        return {
          furnitureName: item.furnitureName,
          furnitureImage: imageResponse.secure_url, 
          furnitureGltfLoader: glbResponse.secure_url, 
        };
      })
    );


    const furnitureData = new Furniture({
      modelType,
      FurnituresImagesArraywithGltf: processedFurnitures,
    });

    const savedFurniture = await furnitureData.save();
    response.status(201).json({ message: 'Furniture saved successfully', data: savedFurniture });
  } catch (error) {
    console.error("Error saving furniture data:", error);
    response.status(500).json({ message: 'Error saving furniture data', error });
  }
});





// Get Furniture
app.get("/getfurnitures", async (req, res) => {
  try {
    const furnitures = await Furniture.find({});
    res.status(200).json(furnitures);
  } catch (error) {
    console.error("Get Furniture Error:", error);
    res.status(500).json({ message: 'Error retrieving furniture data', error });
  }
});

// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
