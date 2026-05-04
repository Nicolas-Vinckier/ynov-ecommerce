const request = require("supertest");
const app = require("../src/index");
const db = require("../src/db/index");

describe("Série de tests pour les commandes (Intégration DB)", () => {
  beforeAll((done) => {
    db.serialize(() => {
      db.run("DELETE FROM orders");
      db.run("DELETE FROM users");
      db.run("DELETE FROM products");
      db.run(
        "INSERT INTO users (id, name, email, password) VALUES (1, 'Test User', 'test@test.com', 'pwd')"
      );
      db.run(
        "INSERT INTO products (id, name, description, price, stock) VALUES (1, 'Test Product', 'Test Description', 99.99, 10)",
        done
      );
    });
  });

  test("Devrait créer une commande avec succès", async () => {
    const response = await request(app).post("/api/orders").send({
      userId: 1,
      total: 99.99,
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.total).toBe(99.99);
  });

  test("Devrait récupérer la commande qu'on vient de créer", async () => {
    const response = await request(app).get("/api/orders");
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
    expect(response.body[0].total).toBe(99.99);
  });

  afterAll((done) => {
    done();
  });
});
