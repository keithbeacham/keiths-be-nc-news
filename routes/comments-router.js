const commentsRouter = require("express").Router();
const {
  deleteCommentById,
  patchCommentById,
} = require("../controllers/comments.controllers");

commentsRouter.delete("/:comment_id", deleteCommentById);
commentsRouter.patch("/:comment_id", patchCommentById);

module.exports = commentsRouter;
