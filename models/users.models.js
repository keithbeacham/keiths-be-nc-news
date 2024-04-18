const db = require("../db/connection");

function selectUsers(username = "%") {
  return db
    .query(
      `SELECT username, name, avatar_url FROM users WHERE username LIKE $1;`,
      [username]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "not found" });
      }
      return rows;
    });
}

module.exports = { selectUsers };
