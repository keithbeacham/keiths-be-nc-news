const { selectTopics, insertTopic } = require("../models/topics.models");

function getAllTopics(req, res, next) {
  return selectTopics().then((topics) => {
    res.status(200).send({ topics });
  });
}

function postTopic(req, res, next) {
  const newTopic = req.body;
  if (!newTopic.slug || !newTopic.description) {
    next({ status: 400, msg: "invalid body" });
  }
  return insertTopic(newTopic)
    .then((topic) => {
      res.status(201).send({ topic });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = { getAllTopics, postTopic };
