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

// user Authentication 

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(403).json({ error: "Access denied" });


  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : authHeader;

  jwt.verify(token, process.env.ACCESS_TOKEN, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    console.log("Decoded user:", req.user); 
    next();
  });
}



// User Schema
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});
const Admins = mongoose.model('Clients', userSchema);

// Furniture Schema
const furnitureSchema = new mongoose.Schema({
  modelType: String,
  category: String,  
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
  console.log(username);
  console.log(password);

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


    const userCollectionName = `user_${username}_data`;


    const userDataSchema = new mongoose.Schema({
      modelType: String,
      category: String,
      FurnituresImagesArraywithGltf: [
        {
          furnitureName: String,
          furnitureImage: String,
          furnitureGltfLoader: String
        }
      ]
    });

 
    const UserCollection = mongoose.models[userCollectionName] || mongoose.model(userCollectionName, userDataSchema);


    if (!mongoose.connection.collections[userCollectionName]) {
      await UserCollection.createCollection();
      console.log(`Created collection for user: ${userCollectionName}`);
    }

    return res.status(200).json({ accessToken, message: "Login successful, navigating to home..." });
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
app.post('/furnitures', authenticateToken, upload.fields([
  { name: 'furnitureGltfLoaderFiles' }, 
  { name: 'furnitureImageFiles' }
]), async (req, res) => {
  try {
    const { name: username } = req.user || {};
    if (!username) {
      return res.status(400).json({ error: 'Invalid user' });
    }
   


    const userCollectionName = `user_${username}_data`;

    if (!req.files || !req.files.furnitureGltfLoaderFiles || req.files.furnitureGltfLoaderFiles.length === 0) {
      return res.status(400).json({ message: 'No GLTF files uploaded' });
    }

    const { modelType, category, FurnituresImagesArraywithGltf } = req.body.data
      ? JSON.parse(req.body.data)
      : {};

    if (!modelType || !category || !FurnituresImagesArraywithGltf) {
      return res.status(400).json({ message: 'Invalid data format' });
    }

    const processedFurnitures = await Promise.all(
      FurnituresImagesArraywithGltf.map(async (item, index) => {
        const gltfFileContent = req.files.furnitureGltfLoaderFiles[index].buffer;
        const imageFileContent = req.files.furnitureImageFiles[index].buffer;
        const gltfFileName = `${Date.now()}-${req.files.furnitureGltfLoaderFiles[index].originalname}`;
        const imageFileName = `${Date.now()}-${req.files.furnitureImageFiles[index].originalname}`;

        const glbResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'raw', public_id: gltfFileName },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(gltfFileContent);
        });

        const imageResponse = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { resource_type: 'image', public_id: imageFileName },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(imageFileContent);
        });

        return {
          furnitureName: item.furnitureName,
          furnitureImage: imageResponse.secure_url,
          furnitureGltfLoader: glbResponse.secure_url,
        };
      })
    );

    const UserCollection = mongoose.models[userCollectionName] || mongoose.model(userCollectionName, userFurnitureSchema);
    const newFurnitureData = new UserCollection({
      modelType,
      category,
      FurnituresImagesArraywithGltf: processedFurnitures,
    });

    const savedFurniture = await newFurnitureData.save();
    res.status(201).json({ message: 'Furniture saved successfully', data: savedFurniture });
  } catch (error) {
    console.error("Error saving furniture data:", error);
    res.status(500).json({ message: 'Error saving furniture data', error });
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
const userFurnitureSchema = new mongoose.Schema({
  modelType: String,
  category: String,
  FurnituresImagesArraywithGltf: [
    {
      furnitureName: String,
      furnitureImage: String,
      furnitureGltfLoader: String
    }
  ]
});


app.get('/userSpecificfurnitures', authenticateToken, async (req, res) => {
  try {
    const { name: username } = req.user || {};
    if (!username) {
      return res.status(400).json({ error: 'Invalid user' });
    }
    console.log("Username from token:", username);

  
    const userCollectionName = `user_${username}_data`;

    const UserCollection = mongoose.models[userCollectionName] || mongoose.model(userCollectionName, userFurnitureSchema);

  
    const furnitureData = await UserCollection.find();

    if (furnitureData.length === 0) {
      return res.status(404).json({ message: 'No furniture data found for this user' });
    }

    return res.status(200).json({ message: 'Furniture data retrieved successfully', data: furnitureData });
  } catch (error) {
    console.error("Error fetching furniture data:", error);
    res.status(500).json({ message: 'Error fetching furniture data', error });
  }
});









// Start Server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
