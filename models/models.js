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

module.exports = { selectTopics, selectArticleById };
