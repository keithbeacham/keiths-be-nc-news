const express = require("express");
const apiRouter = require("./routes/api-router");
const {
  customErrorHandler,
  psqlErrorHandler,
  displayError,
} = require("./errors/index");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api", apiRouter);
app.use(customErrorHandler);
app.use(psqlErrorHandler);

module.exports = app;
