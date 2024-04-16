const request = require("supertest");
const db = require("../db/connection");
const app = require("../app");
const seed = require("../db/seeds/seed");
const seedTestData = require("../db/data/test-data");
const endpointsData = require("../endpoints.json");

beforeEach(() => {
  return seed(seedTestData);
});

afterAll(() => {
  db.end();
});

describe("/api/healthcheck", () => {
  test("GET 200: responds with 200 status", () => {
    return request(app)
      .get("/api/healthcheck")
      .expect(200)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("server online");
      });
  });
});
describe("/api/incorrect_endpoint", () => {
  test("GET 404: responds with 404 status if endpoint doesn't exist", () => {
    return request(app).get("/api/incorrect_endpoint").expect(404);
  });
});
describe("/api/topics", () => {
  describe("GET", () => {
    test("GET 200: responds with 200 status", () => {
      return request(app).get("/api/topics").expect(200);
    });
    test("GET 200: responds with array of all topics, length 3", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(topics.length).toBe(3);
        });
    });
    test("GET 200: responds with array of topics each having a slug and description property ", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(topics.length).toBe(3);
          topics.forEach((topic) => {
            expect(topic).toHaveProperty("slug");
            expect(topic).toHaveProperty("description");
          });
        });
    });
    test("GET 200: responds with array of topics each having a slug and description property, both of type string ", () => {
      return request(app)
        .get("/api/topics")
        .expect(200)
        .then(({ body }) => {
          const { topics } = body;
          expect(topics.length).toBe(3);
          topics.forEach((topic) => {
            expect(typeof topic.slug).toBe("string");
            expect(typeof topic.description).toBe("string");
          });
        });
    });
  });
});
describe("/api", () => {
  test("GET 200: responds with 200 status", () => {
    return request(app).get("/api").expect(200);
  });
  test("GET 200: responds with object with property of endpoints which contains the contents of endpoints.json file", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        expect(body.endpoints).toEqual(endpointsData);
      });
  });
});
describe("/api/articles", () => {
  describe("/api/articles/:article_id", () => {
    test("GET 200: responds with 200 status", () => {
      return request(app).get("/api/articles/1").expect(200);
    });
    test("GET 200: responds with a single article object with properties of author, title, article_id, body, topic, created_at, votes, article_img_url", () => {
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            body: expect.any(String),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
          });
        });
    });
    test("GET 200: responds with a single article object with values of article_id property matching the id sent", () => {
      return request(app)
        .get("/api/articles/2")
        .expect(200)
        .then(({ body }) => {
          const { article } = body;
          expect(article.article_id).toBe(2);
        });
    });
    test("GET 404: responds with 404 and msg 'not found' if out of range query sent", () => {
      return request(app)
        .get("/api/articles/9999")
        .expect(404)
        .then(({ body }) => {
          expect(body.msg).toBe("not found");
        });
    });
    test("GET 400: responds with 400 and msg 'bad request' if invalid query type sent", () => {
      return request(app)
        .get("/api/articles/invalid_type")
        .expect(400)
        .then(({ body }) => {
          expect(body.msg).toBe("bad request");
        });
    });
  });
  describe("/api/articles", () => {
    describe("GET", () => {
      test("GET 200: responds with 200 status", () => {
        return request(app).get("/api/articles").expect(200);
      });
      test("GET 200: responds with array of all articles, length 13", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(13);
          });
      });
      test("GET 200: responds with array of articles each having author, title, article_id, topic, created_at, votes, article_img_url, comment_count properties ", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles.length).toBe(13);
            articles.forEach((article) => {
              expect(article).toMatchObject({
                author: expect.any(String),
                title: expect.any(String),
                article_id: expect.any(Number),
                topic: expect.any(String),
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String),
                comment_count: expect.any(Number),
              });
            });
          });
      });
      test("GET 200: responds with array of articles sorted by created_at in descending order", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body }) => {
            const { articles } = body;
            expect(articles).toBeSortedBy("created_at", { descending: true });
          });
      });
    });
  });
  describe("/api/articles/:article_id/comments", () => {
    describe("GET", () => {
      test("GET 200: responds with a 200 status and an array of comment objects of length 11 for article_id 1", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(11);
          });
      });
      test("GET 200: returns an array of comment objects each with properties comment_id, body, votes, author, article_id, created_at, each of correct type and with article_id equal to the id passed", () => {
        const article_id = 1;
        return request(app)
          .get(`/api/articles/${article_id}/comments`)
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(11);
            comments.forEach((comment) => {
              expect(comment.article_id).toBe(article_id);
              expect(comment).toMatchObject({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                article_id: expect.any(Number),
              });
            });
          });
      });
      test("GET 200: responds with an array of objects ordered by created_at in descending order", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toBeSortedBy("created_at", { descending: true });
          });
      });
      test("GET 200: responds with a 200 status and an empty array if article_id exists but has no associated comments", () => {
        return request(app)
          .get("/api/articles/2/comments")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(0);
          });
      });
      test("GET 400: responds with 400 and msg 'bad request' when sent an invalid (ie. wrong type) article_id", () => {
        return request(app)
          .get("/api/articles/invalid_id/comments")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });
      test("GET 404: responds with 404 and msg 'not found' when sent a valid article_id which doesn't exist in the database", () => {
        return request(app)
          .get("/api/articles/9999/comments")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("not found");
          });
      });
    });
    describe("POST", () => {
      test("POST 201: returns 201 and the inserted comment object when sent a valid comment object", () => {
        const article_id = 1;
        const newComment = {
          body: "comment body",
          username: "lurker",
        };
        return request(app)
          .post(`/api/articles/${article_id}/comments`)
          .send(newComment)
          .expect(201)
          .then(({ body: { comment } }) => {
            expect(comment.article_id).toBe(article_id);
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: expect.any(Number),
            });
          });
      });
      test("POST 201: check the comment has been added to the database", () => {
        const newComment = {
          body: "comment body",
          username: "lurker",
        };
        return request(app)
          .post(`/api/articles/1/comments`)
          .send(newComment)
          .expect(201)
          .then(() => {
            return request(app)
              .get(`/api/articles/1/comments`)
              .expect(200)
              .then(({ body: { comments } }) => {
                expect(comments.length).toBe(12);
              });
          });
      });
      test("POST 400: returns 400 and 'invalid body' message when no object is sent", () => {
        return request(app)
          .post("/api/articles/1/comments")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("invalid body");
          });
      });
      test("POST 400: returns 400 and 'invalid body' message when object is sent without username property", () => {
        const article_id = 1;
        const newComment = {
          body: "comment body",
        };
        return request(app)
          .post(`/api/articles/${article_id}/comments`)
          .send(newComment)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("invalid body");
          });
      });
      test("POST 400: returns 400 and 'invalid body' message when object is sent without body property", () => {
        const article_id = 1;
        const newComment = {
          username: "lurker",
        };
        return request(app)
          .post(`/api/articles/${article_id}/comments`)
          .send(newComment)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("invalid body");
          });
      });
      test("POST 404: returns 404 and 'username not found' when sent a username which doesn't exist in the database", () => {
        const article_id = 1;
        const newComment = {
          body: "comment body",
          username: "new_user",
        };
        return request(app)
          .post(`/api/articles/${article_id}/comments`)
          .send(newComment)
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("username not found");
          });
      });
      test("POST 400: responds with 400 and msg 'bad request' when sent an invalid (ie. wrong type) article_id", () => {
        const newComment = {
          username: "lurker",
          body: "comment body",
        };
        return request(app)
          .post("/api/articles/invalid_id/comments")
          .send(newComment)
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });
      test("POST 404: responds with 404 and msg 'not found' when sent a valid article_id which doesn't exist in the database", () => {
        const newComment = {
          username: "lurker",
          body: "comment body",
        };
        return request(app)
          .post("/api/articles/9999/comments")
          .send(newComment)
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("not found");
          });
      });
    });
  });
});
