const { selectAllUsers } = require("../models/users.models");

function getAllUsers(req, res, next) {
  return selectAllUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = { getAllUsers };
