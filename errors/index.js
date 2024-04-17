const express = require("express");

function customErrorHandler(err, req, res, next) {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else next(err);
}

function psqlErrorHandler(err, req, res, next) {
  switch (err.code) {
    case "22P02":
      res.status(400).send({ msg: "bad request" });
      break;
    case "42601":
    case "23502":
      res.status(400).send({ msg: "invalid body" });
      break;
    case "23503":
      res.status(404).send({ msg: "not found" });
      break;
    default:
      next(err);
  }
}

function displayError(err, req, res, next) {
  console.log("error: ", err);
  console.log("error code: ", err.code);
  next(err);
}

module.exports = { customErrorHandler, psqlErrorHandler, displayError };
