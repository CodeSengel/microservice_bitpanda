const express = require("express");
const router = express.Router();
const platformController = require("../controllers/platformController");

router.get("/getdata", platformController.getGetData); // Utilisez le contrôleur de test

module.exports = router;
