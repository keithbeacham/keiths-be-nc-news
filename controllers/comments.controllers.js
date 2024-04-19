const {
  deleteComment,
  updateComment,
  selectCommentById,
} = require("../models/comments.models");

function deleteCommentById(req, res, next) {
  const { comment_id } = req.params;

  return deleteComment(comment_id)
    .then((comment) => {
      res.status(204).send({});
    })
    .catch((err) => {
      next(err);
    });
}

function patchCommentById(req, res, next) {
  const { comment_id } = req.params;
  const { inc_votes } = req.body;

  return Promise.all([
    updateComment(comment_id, inc_votes),
    selectCommentById(comment_id),
  ])
    .then(([comment]) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
}

function getCommentById(req, res, next) {
  const { comment_id } = req.params;

  return selectCommentById(comment_id)
    .then((comment) => {
      res.status(200).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = { deleteCommentById, patchCommentById, getCommentById };
