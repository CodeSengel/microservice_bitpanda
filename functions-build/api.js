const express = require("express");
const serverless = require("serverless-http");
const cors = require("cors");

const dotenv = require("dotenv"); // Importez dotenv
dotenv.config(); // Chargez les variables d'environnement à partir du fichier .env
const platformRoutes = require("../routes/platformRoutes");

const app = express();

// Middleware pour activer CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("/.netlify/functions/api/", platformRoutes);
module.exports.handler = serverless(app);
