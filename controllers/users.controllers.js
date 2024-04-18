const { selectUsers } = require("../models/users.models");

function getUsers(req, res, next) {
  return selectUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
}

function getUserByUsername(req, res, next) {
  const { username } = req.params;
  return selectUsers(username)
    .then(([user]) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = { getUsers, getUserByUsername };
