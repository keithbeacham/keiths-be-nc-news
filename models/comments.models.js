const db = require("../db/connection");

function deleteComment(commentId) {
  return db
    .query(
      `
    DELETE FROM comments 
    WHERE comment_id = $1 
    RETURNING * ;`,
      [commentId]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
    });
}

function updateComment(commentId, newVote) {
  return db
    .query(
      `
    UPDATE comments 
    SET votes = votes + $1
    WHERE comment_id = $2 
    RETURNING * ;`,
      [newVote, commentId]
    )
    .then(({ rows }) => {
      return rows[0];
    });
}

function selectCommentById(commentId) {
  return db
    .query(`SELECT * FROM comments WHERE comment_id = $1 ;`, [commentId])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      } else return rows[0];
    });
}

module.exports = { deleteComment, updateComment, selectCommentById };
