const commentsRouter = require("express").Router();
const {
  deleteCommentById,
  patchCommentById,
  getCommentById,
} = require("../controllers/comments.controllers");

commentsRouter.delete("/:comment_id", deleteCommentById);
commentsRouter.patch("/:comment_id", patchCommentById);
commentsRouter.get("/:comment_id", getCommentById);

module.exports = commentsRouter;
