const apiRouter = require("express").Router();
const articlesRouter = require("./articles-router");
const commentsRouter = require("./comments-router");
const usersRouter = require("./users-router");
const topicsRouter = require("./topics-router");
const {
  healthCheck,
  getEndpoints,
} = require("../controllers/articles.controllers");

apiRouter.get("/", getEndpoints);
apiRouter.get("/healthcheck", healthCheck);
apiRouter.use("/topics", topicsRouter);
apiRouter.use("/articles", articlesRouter);
apiRouter.use("/comments", commentsRouter);
apiRouter.use("/users", usersRouter);

module.exports = apiRouter;
