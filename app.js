const express = require("express");
const {
  healthCheck,
  getAllTopics,
  getEndpoints,
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
} = require("./controllers/articles.controllers");
const { customErrorHandler, psqlErrorHandler } = require("./errors/index");
const { deleteCommentById } = require("./controllers/comments.controllers");

const app = express();

app.use(express.json());

app.get("/api/healthcheck", healthCheck);
app.get("/api/topics", getAllTopics);
app.get("/api", getEndpoints);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getAllArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);
app.patch("/api/articles/:article_id", patchArticleById);
app.delete("/api/comments/:comment_id", deleteCommentById);

app.use(customErrorHandler);
app.use(psqlErrorHandler);

module.exports = app;
