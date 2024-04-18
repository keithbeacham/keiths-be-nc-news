const topicsRouter = require("express").Router();
const { getAllTopics } = require("../controllers/articles.controllers");

topicsRouter.get("/", getAllTopics);

module.exports = topicsRouter;
