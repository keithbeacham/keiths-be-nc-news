const articlesRouter = require("express").Router();
const {
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
  postArticle,
} = require("../controllers/articles.controllers");

articlesRouter.get("/", getArticles);
articlesRouter.post("/", postArticle);
articlesRouter.get("/:article_id", getArticleById);
articlesRouter.patch("/:article_id", patchArticleById);
articlesRouter.get("/:article_id/comments", getCommentsByArticleId);
articlesRouter.post("/:article_id/comments", postCommentByArticleId);

module.exports = articlesRouter;
