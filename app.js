const express = require("express");
const {
  healthCheck,
  getAllTopics,
  getEndpoints,
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
} = require("./controllers/controllers");

const app = express();

app.use(express.json());

app.get("/api/healthcheck", healthCheck);
app.get("/api/topics", getAllTopics);
app.get("/api", getEndpoints);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);

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
app.use((err, req, res, next) => {
  if (err.code === "42601") {
    res.status(400).send({ msg: "invalid body" });
  } else next(err);
});
app.use((err, req, res, next) => {
  if (err.code === "23503") {
    res.status(404).send({ msg: "not found" });
  } else next(err);
});
app.use((err, req, res, next) => {
  console.log("error code>>", err.code);
  next(err);
});

module.exports = app;
