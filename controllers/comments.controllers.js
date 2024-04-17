const { deleteComment } = require("../models/comments.models");

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

module.exports = { deleteCommentById };
