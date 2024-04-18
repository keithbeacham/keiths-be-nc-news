const {
  selectTopics,
  selectArticleById,
  selectArticles,
  selectCommentsByArticleId,
  insertCommentByArticleId,
  updateArticleById,
  checkUserExists,
  checkTopicExists,
} = require("../models/articles.models");
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

function getArticles(req, res, next) {
  const validQueries = ["topic", "sort_by", "order"];
  if (
    Object.keys(req.query).some((query) => {
      return !validQueries.includes(query);
    })
  ) {
    next({ status: 404, msg: "not found" });
  }
  const { topic, sort_by, order } = req.query;
  return Promise.all([
    selectArticles(topic, sort_by, order),
    checkTopicExists(topic),
  ])
    .then(([articles]) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
}

function getCommentsByArticleId(req, res, next) {
  const { article_id } = req.params;
  return Promise.all([
    selectCommentsByArticleId(article_id),
    selectArticleById(article_id),
  ])
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
}

function postCommentByArticleId(req, res, next) {
  const { article_id } = req.params;
  const { body: newComment } = req;
  if (!newComment.username || !newComment.body) {
    next({ status: 400, msg: "invalid body" });
  }
  return Promise.all([
    insertCommentByArticleId(article_id, newComment),
    checkUserExists(newComment.username),
  ])
    .then(([comment]) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
}

function patchArticleById(req, res, next) {
  const { article_id } = req.params;
  const { body: newVote } = req;

  return Promise.all([
    updateArticleById(article_id, newVote),
    selectArticleById(article_id),
  ])
    .then(([article]) => {
      res.status(200).send({ article });
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
  getArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
};
