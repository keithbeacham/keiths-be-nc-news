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
    SELECT articles.author, title, articles.article_id, topic, articles.body, articles.created_at, articles.votes, article_img_url, 
    COUNT(comments.article_id)::INT as comment_count 
    FROM articles
    LEFT JOIN comments ON articles.article_id = comments.article_id
    WHERE articles.article_id = $1 
    GROUP BY comments.article_id, articles.article_id;`,
      [articleId]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      } else return rows[0];
    });
}

function selectArticles(topic = "%", sortBy = "created_at", order = "DESC") {
  const validOrder = ["ASC", "DESC"];
  const validSortKeys = [
    "title",
    "topic",
    "author",
    "created_at",
    "votes",
    "article_img_url",
  ];
  if (!validSortKeys.includes(sortBy) || !validOrder.includes(order)) {
    return Promise.reject({ status: 400, msg: "bad data" });
  }
  const sqlStr = `
  SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, 
  COUNT(comments.article_id)::INT AS comment_count
  FROM articles
  LEFT JOIN comments 
  ON articles.article_id = comments.article_id 
  WHERE topic LIKE $1 
  GROUP BY comments.article_id, articles.article_id 
  ORDER BY articles.${sortBy} ${order} ;`;
  return db.query(sqlStr, [topic]).then(({ rows }) => {
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

function insertCommentByArticleId(articleId, newComment) {
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
}

function updateArticleById(articleId, newVote) {
  return db
    .query(
      `
        UPDATE articles 
        SET votes = votes + $1
        WHERE article_id = $2 
        RETURNING * ;`,
      [newVote.inc_votes, articleId]
    )
    .then(({ rows }) => {
      return rows[0];
    });
}

function checkUserExists(username) {
  return db
    .query(`SELECT * FROM users WHERE username = $1`, [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
    });
}

function checkTopicExists(topic) {
  if (!topic) {
    return;
  }
  return db
    .query(`SELECT * FROM topics WHERE slug = $1 ;`, [topic])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      } else return rows;
    });
}

module.exports = {
  selectTopics,
  selectArticleById,
  selectArticles,
  selectCommentsByArticleId,
  insertCommentByArticleId,
  updateArticleById,
  checkUserExists,
  checkTopicExists,
};
