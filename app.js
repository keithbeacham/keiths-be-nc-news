const express = require("express");
const apiRouter = require("./routes/api-router");
const {
  customErrorHandler,
  psqlErrorHandler,
  displayError,
} = require("./errors/index");

const app = express();

app.use(express.json());
app.use("/api", apiRouter);
app.use(customErrorHandler);
app.use(psqlErrorHandler);

module.exports = app;
