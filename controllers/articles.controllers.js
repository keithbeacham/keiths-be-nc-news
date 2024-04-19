const {
  selectArticleById,
  selectArticles,
  selectCommentsByArticleId,
  insertCommentByArticleId,
  updateArticleById,
  checkUserExists,
  insertArticle,
  countArticles,
  deleteArticle,
} = require("../models/articles.models");
const { checkTopicExists } = require("../models/topics.models");
const endpoints = require("../endpoints.json");

function healthCheck(req, res, next) {
  res.status(200).send({ msg: "server online" });
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
  const validQueries = ["topic", "sort_by", "order", "limit", "p"];
  const queryKeys = Object.keys(req.query);
  if (queryKeys.some((query) => !validQueries.includes(query))) {
    next({ status: 400, msg: "bad data" });
  }
  let { topic, sort_by, order, limit, p } = req.query;
  if (queryKeys.includes("limit") && !limit) {
    limit = 10;
  }
  if (queryKeys.includes("p") && p <= 0) {
    next({ status: 400, msg: "bad request" });
  }
  return Promise.all([
    selectArticles(topic, sort_by, order, limit, p),
    countArticles(topic),
    checkTopicExists(topic),
  ])
    .then(([articles, { total_count }]) => {
      res.status(200).send({ articles, total_count });
    })
    .catch((err) => {
      next(err);
    });
}

function getCommentsByArticleId(req, res, next) {
  const validQueries = ["limit", "p"];
  const queryKeys = Object.keys(req.query);
  if (queryKeys.some((query) => !validQueries.includes(query))) {
    next({ status: 400, msg: "bad data" });
  }
  const { article_id } = req.params;
  let { limit, p } = req.query;
  if (queryKeys.includes("limit") && !limit) {
    limit = 10;
  }
  if (queryKeys.includes("p") && p <= 0) {
    next({ status: 400, msg: "bad request" });
  }
  return Promise.all([
    selectCommentsByArticleId(article_id, limit, p),
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
  const { inc_votes } = req.body;

  return Promise.all([
    updateArticleById(article_id, inc_votes),
    selectArticleById(article_id),
  ])
    .then(([article]) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

function postArticle(req, res, next) {
  const { author, title, body, topic, article_img_url } = req.body;

  return insertArticle(author, title, body, topic, article_img_url)
    .then((article) => {
      res.status(201).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

function deleteArticleById(req, res, next) {
  const { article_id } = req.params;

  return deleteArticle(article_id)
    .then(() => {
      res.status(204).send({});
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = {
  healthCheck,
  getEndpoints,
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  postCommentByArticleId,
  patchArticleById,
  postArticle,
  deleteArticleById,
};
