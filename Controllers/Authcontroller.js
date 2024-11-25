const jwt = require('jsonwebtoken');
const Admins = require('../Schema/Admin'); 



// login
exports.login = async (req, res) => {
    const { username, password } = req.body;
  
    try {
      const dbResponse = await Admins.findOne({ username });
      if (!dbResponse) {
        return res.status(400).json({ error: "Invalid user" });
      }
  
      if (password !== dbResponse.password) {
        return res.status(401).json({ error: "Invalid password" });
      }
  
    
      const user = { name: username, role: dbResponse.role };
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
  };


// Register User
exports.register = async (req, res) => {
  const { username, password, role } = req.body;

  try {
    const dbResponse = await Admins.findOne({ username });
    if (dbResponse) {
      return res.status(400).json({ error: "User Already Registered" });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be greater than six characters" });
    }

    const user = { name: username, role };
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN);
    console.log(accessToken);

    const newUser = new Admins({ username, password, role });
    await newUser.save();

    return res.status(200).json({ accessToken });
  } catch (error) {
    console.error("Register Error:", error);
    return res.status(500).send("Server Error!");
  }
};

// Get Users
exports.getClients = async (req, res) => {
  try {
    const users = await Admins.find({});
    res.send(users);
  } catch (error) {
    console.error("Get Users Error:", error);
    res.status(500).send("Server Error!");
  }
};

// Delete User
exports.deleteClient = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await Admins.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).send("User not found!");
    }
    res.send("User deleted successfully!");
  } catch (error) {
    console.error("Delete User Error:", error);
    res.status(500).send("Server Error!");
  }
};

// Update User
exports.updateClient = async (req, res) => {
  const { id } = req.params;
  const { name, password } = req.body;
  try {
    const updatedUser = await Admins.findByIdAndUpdate(
      id,
      { name, password },
      { new: true, runValidators: true }
    );
    if (!updatedUser) {
      return res.status(404).send("User not found!");
    }
    res.send(updatedUser);
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).send("Server Error!");
  }
};
