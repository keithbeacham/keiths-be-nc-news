const db = require("../db/connection");
// const format = require("pg-format")

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

module.exports = { selectTopics, selectArticleById, selectAllArticles };
