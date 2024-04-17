const express = require("express");
const {
  healthCheck,
  getAllTopics,
  getEndpoints,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
} = require("./controllers/articles.controllers");
const {
  customErrorHandler,
  psqlErrorHandler,
  displayError,
} = require("./errors/index");
const { deleteCommentById } = require("./controllers/comments.controllers");
const { getAllUsers } = require("./controllers/users.controllers");

const app = express();

app.use(express.json());

app.get("/api/healthcheck", healthCheck);
app.get("/api/topics", getAllTopics);
app.get("/api", getEndpoints);
app.get("/api/articles/:article_id", getArticleById);
app.get("/api/articles", getArticles);
app.get("/api/articles/:article_id/comments", getCommentsByArticleId);
app.post("/api/articles/:article_id/comments", postCommentByArticleId);
app.patch("/api/articles/:article_id", patchArticleById);
app.delete("/api/comments/:comment_id", deleteCommentById);
app.get("/api/users", getAllUsers);

app.use(customErrorHandler);
app.use(psqlErrorHandler);

module.exports = app;
