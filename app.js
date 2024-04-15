const express = require("express");
const {
  healthCheck,
  getAllTopics,
  getEndpoints,
} = require("./controllers/controllers");

const app = express();

app.use(express.json());

app.get("/api/healthcheck", healthCheck);
app.get("/api/topics", getAllTopics);
app.get("/api", getEndpoints);

module.exports = app;
