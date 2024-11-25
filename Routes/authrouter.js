const express = require("express")

const {login,register,getClients, deleteClient,updateClient} = require("../Controllers/Authcontroller")
const router = express.Router()


router.post("/login", login);
router.post("/register", register);
router.get("/getclients", getClients);
router.delete("/clients/:id", deleteClient);
router.put("/modifyclients/:id", updateClient);

module.exports= router;

