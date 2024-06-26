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
  describe("POST", () => {
    test("POST 201: returns status 201 and a complete topic object when sent a valid request body", () => {
      return request(app)
        .post("/api/topics")
        .send({
          slug: "topic name here",
          description: "description here",
        })
        .expect(201)
        .then(({ body: { topic } }) => {
          expect(topic).toMatchObject({
            slug: "topic name here",
            description: "description here",
          });
        });
    });
    test("POST 201: adds the specified topic to the database", () => {
      return request(app)
        .post("/api/topics")
        .send({
          slug: "topic name here",
          description: "description here",
        })
        .then(() => {
          return request(app)
            .get("/api/topics")
            .then(({ body: { topics } }) => {
              expect(topics.length).toBe(4);
              expect(topics[3]).toMatchObject({
                slug: "topic name here",
                description: "description here",
              });
            });
        });
    });
    test("POST 400: returns 400 and msg 'invalid body' if 'slug' key is missing", () => {
      return request(app)
        .post("/api/topics")
        .send({
          description: "description here",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("invalid body");
        });
    });
    test("POST 400: returns 400 and msg 'invalid body' if 'description' key is missing", () => {
      return request(app)
        .post("/api/topics")
        .send({
          slug: "topic name here",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("invalid body");
        });
    });
    test("POST 400: returns 400 and msg 'invalid body' if 'description' property is empty", () => {
      return request(app)
        .post("/api/topics")
        .send({
          slug: "topic name here",
          description: "",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("invalid body");
        });
    });
    test("POST 400: returns 400 and msg 'invalid body' if 'slug' property is empty", () => {
      return request(app)
        .post("/api/topics")
        .send({
          slug: "",
          description: "description",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("invalid body");
        });
    });
    test("POST 400: returns 400 and msg 'invalid body' if 'slug' value already exists in the database", () => {
      return request(app)
        .post("/api/topics")
        .send({
          slug: "cats",
          description: "description",
        })
        .expect(400)
        .then(({ body: { msg } }) => {
          expect(msg).toBe("invalid body");
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
      test("GET 200: responds with property of comment_count in article object which equals the total number of comments referencing this article", () => {
        return request(app)
          .get("/api/articles/1")
          .then(({ body: { article } }) => {
            expect(article.comment_count).toBe(11);
          });
      });
    });
    describe("PATCH", () => {
      test("PATCH 200: responds with 200 status and article object when valid request object sent, returned object has same article_id as that sent and votes has been incremented by value sent", () => {
        const patchObj = { inc_votes: 5 };
        return request(app)
          .patch("/api/articles/1")
          .send(patchObj)
          .expect(200)
          .then(({ body: { article } }) => {
            expect(article).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              article_id: 1,
              body: expect.any(String),
              topic: expect.any(String),
              created_at: expect.any(String),
              votes: 105,
              article_img_url: expect.any(String),
            });
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
      test("PATCH 400: responds with 400 and msg 'bad request' when request object does not include <inc_votes> property", () => {
        const patchObj = { more_votes: 100 };
        return request(app)
          .patch("/api/articles/2")
          .send(patchObj)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("invalid body");
          });
      });
      test("PATCH 400: responds with 400 and msg 'bad request' when request object includes <inc_votes> property with incorrect type of value", () => {
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
    describe("DELETE", () => {
      test("DELETE 204: returns status 204 and no content when valid article_id sent", () => {
        return request(app)
          .delete("/api/articles/1")
          .expect(204)
          .then(({ body }) => {
            expect(body).toEqual({});
          });
      });
      test("DELETE 204: removes given article from database when valid article_id sent", () => {
        return request(app)
          .delete("/api/articles/1")
          .then(() => {
            return request(app)
              .get("/api/articles/1")
              .expect(404)
              .then(({ body: { msg } }) => {
                expect(msg).toBe("not found");
              });
          });
      });
      test("DELETE 204: removes all comments associated with deleted article from database when valid article_id sent", () => {
        return request(app)
          .delete("/api/articles/3")
          .then(() => {
            return request(app)
              .get("/api/comments/10")
              .expect(404)
              .then(() => {
                return request(app).get("/api/comments/11").expect(404);
              });
          });
      });
      test("DELETE 400: returns status 400 and message 'bad request' when invalid article_id sent", () => {
        return request(app)
          .delete("/api/articles/invalid_article_id")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });
      test("DELETE 404: returns status 404 and message 'not found' when article_id is valid but does not exist in the database", () => {
        return request(app)
          .delete("/api/articles/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("not found");
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
      test("GET 400: responds with status 400 and msg 'bad data' when query is not 'topic'", () => {
        return request(app)
          .get("/api/articles?invalid_key=mitch")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad data");
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
    describe("GET ?limit & p", () => {
      test("GET 200: retrieves 10 articles when limit is specified but no value set", () => {
        return request(app)
          .get("/api/articles?limit")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(10);
          })
          .then(() => {
            return request(app)
              .get("/api/articles?limit=")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(10);
              });
          });
      });
      test("GET 200: retrieves number of articles requested when limit is specified with a value set", () => {
        return request(app)
          .get("/api/articles?limit=7")
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(7);
          });
      });
      test("GET 200: retrieves no articles when limit is specified with a value set to 0", () => {
        return request(app)
          .get("/api/articles?limit=0")
          .then(({ body: { articles } }) => {
            expect(articles).toEqual([]);
          });
      });
      test("GET 200: retrieves all articles when limit is specified with a value greater than the total number of articles in the database", () => {
        return request(app)
          .get("/api/articles?limit=20")
          .then(({ body: { articles } }) => {
            expect(articles.length).toBe(13);
          });
      });
      test("GET 200: retrieves first 10 articles when limit is specified but no value set and p is specified as 1", () => {
        let firstArticle = {};
        return request(app)
          .get("/api/articles")
          .then(({ body: { articles } }) => {
            firstArticle = articles[0];
          })
          .then(() => {
            return request(app)
              .get("/api/articles?limit&p=1")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(10);
                expect(articles[0]).toEqual(firstArticle);
              });
          });
      });
      test("GET 200: retrieves last 3 articles when limit is specified but no value set and p is specified as 2", () => {
        let eleventhArticle = {};
        return request(app)
          .get("/api/articles")
          .then(({ body: { articles } }) => {
            eleventhArticle = articles[10];
          })
          .then(() => {
            return request(app)
              .get("/api/articles?limit&p=2")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(3);
                expect(articles[0]).toEqual(eleventhArticle);
              });
          });
      });
      test("GET 200: retrieves last 5 articles when limit is specified as 8 and p is specified as 2", () => {
        let ninethArticle = {};
        return request(app)
          .get("/api/articles")
          .then(({ body: { articles } }) => {
            ninethArticle = articles[8];
          })
          .then(() => {
            return request(app)
              .get("/api/articles?limit=8&p=2")
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(5);
                expect(articles[0]).toEqual(ninethArticle);
              });
          });
      });
      test("GET 200: returns 200 and empty array when limit is specified as 10 and p is specified as 3", () => {
        return request(app)
          .get("/api/articles?limit&p=3")
          .expect(200)
          .then(({ body: { articles } }) => {
            expect(articles).toEqual([]);
          });
      });
      test("GET 200: works with topic, sort_by and order queries", () => {
        let eleventhArticle = {};
        return request(app)
          .get("/api/articles?topic=mitch&sort_by=author&order=ASC")
          .then(({ body: { articles } }) => {
            eleventhArticle = articles[10];
          })
          .then(() => {
            return request(app)
              .get(
                "/api/articles?topic=mitch&sort_by=author&order=ASC&limit=5&p=3"
              )
              .expect(200)
              .then(({ body: { articles } }) => {
                expect(articles.length).toBe(2);
                expect(articles[0]).toEqual(eleventhArticle);
              });
          });
      });
      test("GET 200: returns total_count property, displaying the total number of articles", () => {
        return request(app)
          .get("/api/articles")
          .then(({ body: { total_count } }) => {
            expect(total_count).toEqual(13);
          });
      });
      test("GET 200: the total_count property is not affected by pagination", () => {
        return request(app)
          .get("/api/articles?limit=5&p=3")
          .then(({ body: { total_count } }) => {
            expect(total_count).toBe(13);
          });
      });
      test("GET 200: the total_count property reflects the results of the topic filter", () => {
        return request(app)
          .get("/api/articles?topic=cats")
          .then(({ body: { total_count } }) => {
            expect(total_count).toBe(1);
          });
      });
      test("GET 400: returns 400 and msg 'bad request' when limit is given an invalid value (wrong type)", () => {
        return request(app)
          .get("/api/articles?limit=invalid_type")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });
      test("GET 400: returns 400 and msg 'bad request' when limit is given an invalid value (out of range)", () => {
        return request(app)
          .get("/api/articles?limit=-1")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });
      test("GET 400: returns 400 and msg 'bad request' when p is specified as invalid (wrong type)", () => {
        return request(app)
          .get("/api/articles?p=invalid")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });
      test("GET 400: returns 400 and msg 'bad request' when p is specified as invalid (out of range)", () => {
        return request(app)
          .get("/api/articles?p=-1")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          })
          .then(() => {
            return request(app)
              .get("/api/articles?p=0")
              .expect(400)
              .then(({ body: { msg } }) => {
                expect(msg).toBe("bad request");
              });
          });
      });
    });
    describe("POST", () => {
      test("POST 201: returns status 201 and a complete article object with votes=0 and comment_count=0 when sent a valid request body", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "lurker",
            title: "a day in the life",
            body: "it all started quite normally that day...",
            topic: "mitch",
            article_img_url:
              "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
          })
          .expect(201)
          .then(({ body: { article } }) => {
            expect(article).toMatchObject({
              article_id: expect.any(Number),
              author: "lurker",
              title: "a day in the life",
              body: "it all started quite normally that day...",
              topic: "mitch",
              article_img_url:
                "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
              votes: 0,
              created_at: expect.any(String),
              comment_count: 0,
            });
          });
      });
      test("POST 201: inserts the default article_img_url in the comment if none is specified in the request body", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "lurker",
            title: "a day in the life",
            body: "it all started quite normally that day...",
            topic: "mitch",
          })
          .expect(201)
          .then(({ body: { article } }) => {
            expect(article.article_img_url).toBe(
              "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700"
            );
          });
      });
      test("POST 404: returns 404 and msg 'not found' if author does not exist in the database", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "invalid_author",
            title: "a day in the life",
            body: "it all started quite normally that day...",
            topic: "mitch",
          })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("not found");
          });
      });
      test("POST 404: returns 404 and msg 'not found' if topic does not exist in the database", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "lurker",
            title: "a day in the life",
            body: "it all started quite normally that day...",
            topic: "invalid_topic",
          })
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("not found");
          });
      });
      test("POST 400: returns 400 and msg 'invalid body' if author key is missing", () => {
        return request(app)
          .post("/api/articles")
          .send({
            title: "a day in the life",
            body: "it all started quite normally that day...",
            topic: "mitch",
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("invalid body");
          });
      });
      test("POST 400: returns 400 and msg 'invalid body' if title key is missing", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "lurker",
            body: "it all started quite normally that day...",
            topic: "mitch",
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("invalid body");
          });
      });
      test("POST 400: returns 400 and msg 'invalid body' if body key is missing", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "lurker",
            title: "a day in the life",
            topic: "mitch",
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("invalid body");
          });
      });
      test("POST 400: returns 400 and msg 'invalid body' if topic key is missing", () => {
        return request(app)
          .post("/api/articles")
          .send({
            author: "lurker",
            title: "a day in the life",
            body: "it all started quite normally that day...",
          })
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("invalid body");
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
    describe("GET ?limit & p", () => {
      test("GET 200: retrieves 10 comments when limit is specified but no value set", () => {
        return request(app)
          .get("/api/articles/1/comments?limit")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(10);
          })
          .then(() => {
            return request(app)
              .get("/api/articles/1/comments?limit=")
              .expect(200)
              .then(({ body: { comments } }) => {
                expect(comments.length).toBe(10);
              });
          });
      });
      test("GET 200: retrieves number of comments requested when limit is specified with a value set", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=7")
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(7);
          });
      });
      test("GET 200: retrieves no comments when limit is specified with a value set to 0", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=0")
          .then(({ body: { comments } }) => {
            expect(comments).toEqual([]);
          });
      });
      test("GET 200: retrieves all comments when limit is specified with a value greater than the total number of comments in the database for the specified article", () => {
        return request(app)
          .get("/api/articles/3/comments?limit=20")
          .then(({ body: { comments } }) => {
            expect(comments.length).toBe(2);
          });
      });
      test("GET 200: retrieves first 10 comments when limit is specified but no value set and p is specified as 1", () => {
        let firstComment = {};
        return request(app)
          .get("/api/articles/1/comments")
          .then(({ body: { comments } }) => {
            firstComment = comments[0];
          })
          .then(() => {
            return request(app)
              .get("/api/articles/1/comments?limit&p=1")
              .expect(200)
              .then(({ body: { comments } }) => {
                expect(comments.length).toBe(10);
                expect(comments[0]).toEqual(firstComment);
              });
          });
      });
      test("GET 200: retrieves last 1 comment when limit is specified but no value set and p is specified as 2", () => {
        let eleventhComment = {};
        return request(app)
          .get("/api/articles/1/comments")
          .then(({ body: { comments } }) => {
            eleventhComment = comments[10];
          })
          .then(() => {
            return request(app)
              .get("/api/articles/1/comments?limit&p=2")
              .expect(200)
              .then(({ body: { comments } }) => {
                expect(comments.length).toBe(1);
                expect(comments[0]).toEqual(eleventhComment);
              });
          });
      });
      test("GET 200: retrieves last 3 comments when limit is specified as 8 and p is specified as 2", () => {
        let ninethComment = {};
        return request(app)
          .get("/api/articles/1/comments")
          .then(({ body: { comments } }) => {
            ninethComment = comments[8];
          })
          .then(() => {
            return request(app)
              .get("/api/articles/1/comments?limit=8&p=2")
              .expect(200)
              .then(({ body: { comments } }) => {
                expect(comments.length).toBe(3);
                expect(comments[0]).toEqual(ninethComment);
              });
          });
      });
      test("GET 200: returns 200 and empty array when limit is specified as 10 and p is specified as 3", () => {
        return request(app)
          .get("/api/articles/1/comments?limit&p=3")
          .expect(200)
          .then(({ body: { comments } }) => {
            expect(comments).toEqual([]);
          });
      });
      test("GET 400: returns 400 and msg 'bad request' when limit is given an invalid value (wrong type)", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=invalid_type")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });
      test("GET 400: returns 400 and msg 'bad request' when limit is given an invalid value (out of range)", () => {
        return request(app)
          .get("/api/articles/1/comments?limit=-1")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });
      test("GET 400: returns 400 and msg 'bad request' when p is specified as invalid (wrong type)", () => {
        return request(app)
          .get("/api/articles/1/comments?p=invalid")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          });
      });
      test("GET 400: returns 400 and msg 'bad request' when p is specified as invalid (out of range)", () => {
        return request(app)
          .get("/api/articles/3/comments?p=-1")
          .expect(400)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("bad request");
          })
          .then(() => {
            return request(app)
              .get("/api/articles/5/comments?p=0")
              .expect(400)
              .then(({ body: { msg } }) => {
                expect(msg).toBe("bad request");
              });
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
    describe("PATCH", () => {
      test("PATCH 200: responds with status 200 and an updated comment object when sent a request object with property inc_votes. The returned object has its votes property incremented by the value of inc_votes", () => {
        return request(app)
          .patch("/api/comments/1")
          .send({ inc_votes: 5 })
          .expect(200)
          .then(({ body: { comment } }) => {
            expect(comment).toMatchObject({
              comment_id: 1,
              body: expect.any(String),
              votes: 21,
              author: expect.any(String),
              article_id: expect.any(Number),
              created_at: expect.any(String),
            });
          });
      });
      test("PATCH 404: responds with 404 and msg 'not found' when sent a valid comment_id which does not exist in the database", () => {
        const patchObj = { inc_votes: 5 };
        return request(app)
          .patch("/api/comments/9999")
          .send(patchObj)
          .expect(404)
          .then(({ body }) => {
            expect(body.msg).toBe("not found");
          });
      });
      test("PATCH 400: responds with 400 and msg 'bad request' when invalid comment_id type sent", () => {
        const patchObj = { inc_votes: 5 };
        return request(app)
          .patch("/api/comments/invalid_type")
          .send(patchObj)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad request");
          });
      });
      test("PATCH 400: responds with 400 and msg 'bad request' when request object is empty", () => {
        return request(app)
          .patch("/api/comments/2")
          .send({})
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("invalid body");
          });
      });
      test("PATCH 400: responds with 400 and msg 'bad request' when request object does not include <inc_votes> property", () => {
        const patchObj = { more_votes: 100 };
        return request(app)
          .patch("/api/comments/2")
          .send(patchObj)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("invalid body");
          });
      });
      test("PATCH 400: responds with 400 and msg 'bad request' when request object includes <inc_votes> property with incorrect type of value", () => {
        const patchObj = { inc_votes: "invalid_type" };
        return request(app)
          .patch("/api/comments/2")
          .send(patchObj)
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad request");
          });
      });
    });
    describe("GET", () => {
      test("GET 200: returns 200 and the requested comment object", () => {
        return request(app)
          .get("/api/comments/1")
          .expect(200)
          .then(({ body: { comment } }) => {
            expect(comment).toMatchObject({
              comment_id: 1,
              body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
              votes: 16,
              author: "butter_bridge",
              article_id: 9,
              created_at: expect.any(String),
            });
          });
      });
      test("GET 404: returns 404 and msg 'not found' when the requested comment does not exist in the database", () => {
        return request(app)
          .get("/api/comments/9999")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("not found");
          });
      });
      test("GET 400: responds with 400 and msg 'bad request' when invalid comment_id type sent", () => {
        return request(app)
          .get("/api/comments/invalid_type")
          .expect(400)
          .then(({ body }) => {
            expect(body.msg).toBe("bad request");
          });
      });
    });
  });
  describe("/api/users", () => {
    describe("GET", () => {
      test("GET 200: returns 200 and an array of 4 user objects containing username, name and avatar_url properties each of type 'string'", () => {
        return request(app)
          .get("/api/users")
          .expect(200)
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
  describe("/api/users/:username", () => {
    describe("GET", () => {
      test("GET 200: returns 200 and a user object with the properties of username, avatar_url and name with the values equal to the username which was sent", () => {
        return request(app)
          .get("/api/users/lurker")
          .expect(200)
          .then(({ body: { user } }) => {
            expect(user).toMatchObject({
              username: "lurker",
              name: "do_nothing",
              avatar_url:
                "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
            });
          });
      });
      test("GET 404: returns 404 and a msg 'not found' when sent a username which doesnt exist in the database", () => {
        return request(app)
          .get("/api/users/invalid_username")
          .expect(404)
          .then(({ body: { msg } }) => {
            expect(msg).toBe("not found");
          });
      });
    });
  });
});
