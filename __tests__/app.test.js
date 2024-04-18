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
    describe("GET", () => {
      test("GET 200: responds with 200 status", () => {
        return request(app).get("/api/articles/1").expect(200);
      });
      test("GET 200: responds with a single article object with properties of author, title, article_id, body, topic, created_at, votes, article_img_url, with article_id matching the id sent", () => {
        return request(app)
          .get("/api/articles/1")
          .expect(200)
          .then(({ body }) => {
            const { article } = body;
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: 1,
              body: expect.any(String),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: expect.any(Number),
              article_img_url: expect.any(String),
            });
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
    describe("PATCH", () => {
      test("PATCH 200: responds with 200 status and article object when valid request object sent", () => {
        const patchObj = { inc_votes: 5 };
        return request(app)
          .patch("/api/articles/1")
          .send(patchObj)
          .expect(200)
          .then(({ body: { article } }) => {
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
      test("PATCH 200: returned article object has same article_id as that sent and votes has been incremented by value sent", () => {
        const patchObj = { inc_votes: 5 };
        return request(app)
          .patch("/api/articles/1")
          .send(patchObj)
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article.article_id).toBe(1);
            expect(article.votes).toBe(105);
          });
      });
      test("PATCH 404: responds with 404 and msg 'not found' when sent a valid article_id which does not exist in the database", () => {
        const patchObj = { inc_votes: 5 };
        return request(app)
          .patch("/api/articles/9999")
          .send(patchObj)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("not found");
          });
      });
      test("PATCH 400: responds with 400 and msg 'bad request' when invalid article_id type sent", () => {
        const patchObj = { inc_votes: 5 };
        return request(app)
          .patch("/api/articles/invalid_type")
          .send(patchObj)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad request");
          });
      });
      test("PATCH 400: responds with 400 and msg 'bad request' when request object is empty", () => {
        return request(app)
          .patch("/api/articles/2")
          .send({})
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("invalid body");
          });
      });
      test("PATCH 400: reposnds with 400 and msg 'bad request' when request object does not include <inc_votes> property", () => {
        const patchObj = { more_votes: 100 };
        return request(app)
          .patch("/api/articles/2")
          .send(patchObj)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("invalid body");
          });
      });
      test("PATCH 400: reposnds with 400 and msg 'bad request' when request object includes <inc_votes> property with incorrect type of value", () => {
        const patchObj = { inc_votes: "invalid_type" };
        return request(app)
          .patch("/api/articles/2")
          .send(patchObj)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad request");
          });
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
    describe("GET ?topic", () => {
      test("GET 200: responds with 12 articles when sent query string of topic=mitch", () => {
        return request(app)
          .get("/api/articles?topic=mitch")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(12);
          });
      });
      test("GET 200: responds with 0 articles when sent query string of topic=paper", () => {
        return request(app)
          .get("/api/articles?topic=paper")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(0);
          });
      });
      test("GET 200: responds with articles each with properties of article_id, title, author, body, created_at, article_img_url, comment_count, votes and with a topic property of value 'mitch'", () => {
        return request(app)
          .get("/api/articles?topic=mitch")
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(12);
            articles.forEach((article) => {
              expect(article).toMatchObject({
                author: expect.any(String),
                title: expect.any(String),
                article_id: expect.any(Number),
                topic: "mitch",
                created_at: expect.any(String),
                votes: expect.any(Number),
                article_img_url: expect.any(String),
                comment_count: expect.any(Number),
              });
            });
          });
      });
      test("GET 200: responds with array of articles ordered by created_at descending", () => {
        return request(app)
          .get("/api/articles?topic=mitch")
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("created_at", { descending: true });
          });
      });
      test("GET 404: responds with status 404 and msg 'not found' when query is not 'topic'", () => {
        return request(app)
          .get("/api/articles?invalid_key=mitch")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("not found");
          });
      });
      test("GET 404: reponds with status 404 and msg 'not found' when query value is not in database", () => {
        return request(app)
          .get("/api/articles?topic=invalid_topic")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("not found");
          });
      });
    });
    describe("GET ?sort_by & order", () => {
      test("GET 200: sorts by created_at descending by default", () => {
        return request(app)
          .get("/api/articles")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("created_at", { descending: true });
          });
      });
      test("GET 200: sorts by sort_by key in descending order by default", () => {
        return request(app)
          .get("/api/articles?sort_by=topic")
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("topic", { descending: true });
          });
      });
      test("GET 200: sorts by sort_by key in descending order when order=DESC", () => {
        return request(app)
          .get("/api/articles?sort_by=votes&order=DESC")
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("votes", { descending: true });
          });
      });
      test("GET 200: sorts by sort_by key in ascending order when order=ASC", () => {
        return request(app)
          .get("/api/articles?sort_by=author&order=ASC")
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("author", { descending: false });
          });
      });
      test("GET 200: sorts by created_at in ascending order when no sort_by sent and order=ASC", () => {
        return request(app)
          .get("/api/articles?order=ASC")
          .then(({ body: { articles } }) => {
            expect(articles).toBeSortedBy("created_at", { descending: false });
          });
      });
      test("GET 200: sorts by sort_by key and orders by order key when topic filter query also sent", () => {
        return request(app)
          .get("/api/articles?topic=mitch&sort_by=votes&order=ASC")
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(12);
            expect(articles).toBeSortedBy("votes", { descending: false });
          });
      });
      test("GET 400: returns 400 and message 'bad data' when invalid sort_by key sent", () => {
        return request(app)
          .get("/api/articles?sort_by=invalid_key")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad data");
          });
      });
      test("GET 400: returns 400 and message 'bad data' when invalid order key sent", () => {
        return request(app)
          .get("/api/articles?sort_by=votes&order=invalid_key")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad data");
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
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(11);
            comments.forEach((comment) => {
              expect(comment).toMatchObject({
                comment_id: expect.any(Number),
                votes: expect.any(Number),
                created_at: expect.any(String),
                author: expect.any(String),
                body: expect.any(String),
                article_id: article_id,
              });
            });
          });
      });
      test("GET 200: responds with an array of objects ordered by created_at in descending order", () => {
        return request(app)
          .get("/api/articles/1/comments")
          .then(({ body: { comments } }) => {
            expect(comments).toBeSortedBy("created_at", { descending: true });
          });
      });
      test("GET 200: responds with an empty array if article_id exists but has no associated comments", () => {
        return request(app)
          .get("/api/articles/2/comments")
          .then(({ body: { comments } }) => {
            expect(comments).toEqual([]);
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
            expect(comment).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: article_id,
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
      test("POST 404: returns 404 and 'not found' when sent a username which doesn't exist in the database", () => {
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
            expect(msg).toBe("not found");
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
  describe("/api/comments/:comment_id", () => {
    describe("DELETE", () => {
      test("DELETE 204: returns status 204 and no content when valid comment_id sent", () => {
        return request(app)
          .delete("/api/comments/1")
          .expect(204)
          .then(({ body }) => {
            expect(body).toEqual({});
          });
      });
      test("DELETE 204: removes given comment from database when valid comment_id sent", () => {
        return request(app)
          .delete("/api/comments/16")
          .then(() => {
            return request(app)
              .get("/api/articles/6/comments")
              .expect(200)
              .then(({ body: { comments } }) => {
                expect(comments).toEqual([]);
              });
          });
      });
      test("DELETE 400: returns status 400 and message 'bad request' when invalid comment_id sent", () => {
        return request(app)
          .delete("/api/comments/invalid_comment_id")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });
      test("DELETE 404: returns status 404 and message 'not found' when comment_id is valid but does not exist in the database", () => {
        return request(app)
          .delete("/api/comments/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("not found");
          });
      });
    });
  });
  describe("/api/users", () => {
    describe("GET", () => {
      test("GET 200: returns 200 and an array of 4 users", () => {
        return request(app)
          .get("/api/users")
          .expect(200)
          .then(({ body: { users } }) => {
            expect(users.length).toBe(4);
          });
      });
      test("GET 200: returns an array of user objects containing username, name and avatar_url properties each of type 'string'", () => {
        return request(app)
          .get("/api/users")
          .then(({ body: { users } }) => {
            expect(users.length).toBe(4);
            users.forEach((user) => {
              expect(user).toMatchObject({
                username: expect.any(String),
                name: expect.any(String),
                avatar_url: expect.any(String),
              });
            });
          });
      });
    });
  });
});
