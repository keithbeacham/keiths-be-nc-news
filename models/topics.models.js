const db = require("../db/connection");

function selectTopics() {
  return db.query(`SELECT * FROM topics ;`).then(({ rows }) => {
    return rows;
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

function insertTopic(topic) {
  return db
    .query(
      `
    INSERT INTO topics (description, slug) 
    VALUES ($1, $2)
    RETURNING * ;`,
      [topic.description, topic.slug]
    )
    .then(({ rows }) => {
      return rows[0];
    });
}

module.exports = { selectTopics, checkTopicExists, insertTopic };
