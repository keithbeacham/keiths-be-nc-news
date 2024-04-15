const express = require("express");
const {
  healthCheck,
  getAllTopics,
  getEndpoints,
  getArticleById,
  getAllArticles,
} = require("./controllers/controllers");

const app = express();

app.use(express.json());

app.get("/api/healthcheck", healthCheck);
app.get("/api/topics", getAllTopics);
app.get("/api", getEndpoints);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getAllArticles);

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
});
app.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "bad request" });
  } else next(err);
});

module.exports = app;
