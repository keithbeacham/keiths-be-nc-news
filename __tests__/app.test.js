const request = require("supertest");
const db = require("../db/connection");
const app = require("../app");
const seed = require("../db/seeds/seed");
const seedTestData = require("../db/data/test-data");

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
describe("/api/", () => {
  test("GET 404: responds with 404 status if endpoint doesn't exist", () => {
    return request(app).get("/api/incorrect_end_point").expect(404);
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
