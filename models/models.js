const db = require("../db/connection");
const format = require("pg-format");

function selectTopics() {
  return db.query(`SELECT * FROM topics ;`).then(({ rows }) => {
    return rows;
  });
}

function selectArticleById(articleId) {
  return db
    .query(
      `
    SELECT * 
    FROM articles
    WHERE articles.article_id = $1 ;`,
      [articleId]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      } else return rows[0];
    });
}

function selectAllArticles() {
  return db
    .query(
      `
    SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, 
    COUNT(comments.article_id)::INT AS comment_count
    FROM articles
    LEFT JOIN comments 
    ON articles.article_id = comments.article_id 
    GROUP BY comments.article_id, articles.article_id 
    ORDER BY articles.created_at DESC ;`
    )
    .then(({ rows }) => {
      return rows;
    });
}

function selectCommentsByArticleId(articleId) {
  return db
    .query(
      `
    SELECT * FROM comments 
    WHERE article_id = $1 
    ORDER BY created_at DESC ;`,
      [articleId]
    )
    .then(({ rows }) => {
      return rows;
    });
}

function checkArticleIdExists(articleId) {
  return db
    .query(`SELECT title FROM articles WHERE article_id = $1`, [articleId])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
    });
}

function insertCommentByArticleId(articleId, newComment) {
  return checkIfUserExists(newComment.username)
    .then(() => {
      return db
        .query(
          ` INSERT INTO comments (body, author, article_id)
            VALUES ($1, $2, $3)
            RETURNING * ;`,
          [newComment.body, newComment.username, articleId]
        )
        .then(({ rows }) => {
          return rows[0];
        });
    })
    .catch((err) => {
      return Promise.reject(err);
    });
}

function checkIfUserExists(username) {
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "username not found" });
      }
    });
}

module.exports = {
  selectTopics,
  selectArticleById,
  selectAllArticles,
  selectCommentsByArticleId,
  checkArticleIdExists,
  insertCommentByArticleId,
};
