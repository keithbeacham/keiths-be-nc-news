const {
  selectTopics,
  selectArticleById,
  selectAllArticles,
  selectCommentsByArticleId,
  checkArticleIdExists,
} = require("../models/models");
const endpoints = require("../endpoints.json");

function healthCheck(req, res, next) {
  res.status(200).send({ msg: "server online" });
}

function getAllTopics(req, res, next) {
  return selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
}

function getEndpoints(req, res, next) {
  res.status(200).send({ endpoints });
}

function getArticleById(req, res, next) {
  const { article_id } = req.params;
  return selectArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

function getAllArticles(req, res, next) {
  return selectAllArticles().then((articles) => {
    res.status(200).send({ articles });
  });
}

function getCommentsByArticleId(req, res, next) {
  const { article_id } = req.params;
  return Promise.all([
    selectCommentsByArticleId(article_id),
    checkArticleIdExists(article_id),
  ])
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = {
  healthCheck,
  getAllTopics,
  getEndpoints,
  getArticleById,
  getAllArticles,
  getCommentsByArticleId,
};
