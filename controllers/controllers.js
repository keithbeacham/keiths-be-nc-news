const { selectTopics, selectArticleById } = require("../models/models");
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
  if (Number.isNaN(article_id - 0)) {
    next({ status: 400, msg: "bad request" });
  } else {
    return selectArticleById(article_id)
      .then((article) => {
        res.status(200).send({ article });
      })
      .catch((err) => {
        next(err);
      });
  }
}

module.exports = { healthCheck, getAllTopics, getEndpoints, getArticleById };
