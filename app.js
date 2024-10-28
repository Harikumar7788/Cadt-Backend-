require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const uri = process.env.MONGODB_URI;

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
   .then(() => console.log("MongoDB Connected"))
   .catch(err => console.log("MongoDB Connection Error:", err));
const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const furnitureSchema = new mongoose.Schema({
  modelType: String,
  FurnituresImagesArraywithGltf: [
    {
      furnitureName: String,         
      furnitureImage: String,        
      furnitureGltfLoader: Buffer,   
    },
  ],
});

const Furniture = mongoose.model('Furnitures', furnitureSchema);



const admins = mongoose.model('Clients', userSchema);

app.post("/login", async (request, response) => {
  const { username, password } = request.body;
  console.log(username);
  console.log(password);

  try {
    const dbresponse = await admins.findOne({ username: username });
    console.log('Database response:', dbresponse);

    if (!dbresponse) {
      return response.status(400).json({ error: "Invalid user" });
    }

    if (password !== dbresponse.password) {
      return response.status(401).json({ error: "Invalid password" });
    }

    const user = { name: username, auth: "user", tokenmode: "notadmin" };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN);
    console.log('Login successful, sending token');
    return response.status(200).json({ accessToken });

  } catch (e) {
    console.error(e);
    return response.status(500).send("Server Error!");
  }
});

app.post("/register", async (request, response) => {
  const { username, password } = request.body;

  try {
    const dbresponse = await admins.findOne({ username: username });
    console.log(dbresponse);

    if (dbresponse) {
      return response.status(400).json({ error: "User Already Registered" });
    } else {
      if (password.length < 6) {
        return response.status(400).json({ error: "Password must be greater than six characters" });
      }
      const user = { name: username };
      const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN);
      const newUser = new admins({ username: username, password: password });
      await newUser.save();
      return response.status(200).json({ accessToken });
    }
  } catch (e) {
    console.error(e);
    return response.status(500).send("Server Error!");
  }
});

app.get("/users", async (request, response) => {
  try {
    const users = await admins.find({});
    response.send(users);
  } catch (e) {
    console.error(e);
    response.status(500).send("Server Error!");
  }
});


app.post('/furnitures', async (request, response) => {
  try {
    const { modelType, FurnituresImagesArraywithGltf } = request.body;
     console.log("Api Running!!!!!.....")
    const furnitureData = new Furniture({
      modelType,
      FurnituresImagesArraywithGltf,
    });

    const savedFurniture = await furnitureData.save();
    response.status(201).json({ message: 'Furniture saved successfully', data: savedFurniture });
  } catch (error) {
    response.status(500).json({ message: 'Error saving furniture data', error });
  }
});



app.get("/getfurnitures", async (request, response) => {
  try {
    const furnituresValue = await Furniture.find({});
    response.status(200).json(furnituresValue);
  } catch (error) {
    response.status(500).json({ message: 'Error retrieving furniture data', error });
  }
});



const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
