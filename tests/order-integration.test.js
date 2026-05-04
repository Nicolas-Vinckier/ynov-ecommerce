const request = require("supertest");
const app = require("../src/index");
const db = require("../src/db/index");

describe("Série de tests pour les commandes (Intégration DB)", () => {
  let createdOrderId;

  beforeAll((done) => {
    // Sécurité supplémentaire : on attend que la DB soit prête
    const checkReady = () => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='orders'", (err, row) => {
        if (row) {
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
        } else {
          setTimeout(checkReady, 100);
        }
      });
    };
    checkReady();
  });

  test("Devrait créer une commande avec succès", async () => {
    const response = await request(app).post("/api/orders").send({
      userId: 1,
      total: 99.99,
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    createdOrderId = response.body.id;
    expect(response.body.total).toBe(99.99);
  });

  test("Devrait échouer à créer une commande si données manquantes", async () => {
    const response = await request(app).post("/api/orders").send({
      userId: 1,
    });
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test("Devrait récupérer la liste des commandes", async () => {
    const response = await request(app).get("/api/orders");
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("Devrait récupérer une commande par son ID", async () => {
    const response = await request(app).get(`/api/orders/${createdOrderId}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(createdOrderId);
  });

  test("Devrait renvoyer 404 pour une commande inexistante", async () => {
    const response = await request(app).get("/api/orders/999999");
    expect(response.status).toBe(404);
  });

  test("Devrait mettre à jour le statut d'une commande", async () => {
    const response = await request(app)
      .patch(`/api/orders/${createdOrderId}/status`)
      .send({ status: "shipped" });
    
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("shipped");
  });

  test("Devrait échouer avec un statut invalide", async () => {
    const response = await request(app)
      .patch(`/api/orders/${createdOrderId}/status`)
      .send({ status: "en_route_vers_mars" });
    
    expect(response.status).toBe(400);
  });

  test("Devrait renvoyer 404 lors du PATCH d'une commande inexistante", async () => {
    const response = await request(app)
      .patch("/api/orders/999999/status")
      .send({ status: "shipped" });
    
    expect(response.status).toBe(404);
  });

  // --- TESTS POUR COUVERTURE 100% (SIMULATION ERREURS 500) ---

  test("Devrait renvoyer 500 si la DB échoue sur GET /", async () => {
    const spy = jest.spyOn(db, "all").mockImplementation((sql, params, cb) => {
      cb(new Error("Erreur DB simulée"), null);
    });

    const response = await request(app).get("/api/orders");
    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Erreur DB simulée");
    spy.mockRestore();
  });

  test("Devrait renvoyer 500 si la DB échoue sur GET /:id", async () => {
    const spy = jest.spyOn(db, "get").mockImplementation((sql, params, cb) => {
      cb(new Error("Erreur DB simulée"), null);
    });

    const response = await request(app).get("/api/orders/1");
    expect(response.status).toBe(500);
    spy.mockRestore();
  });

  test("Devrait renvoyer 500 si la DB échoue sur POST /", async () => {
    const spy = jest.spyOn(db, "run").mockImplementation((sql, params, cb) => {
      cb(new Error("Erreur DB simulée"));
    });

    const response = await request(app).post("/api/orders").send({
      userId: 1,
      total: 10,
    });
    expect(response.status).toBe(500);
    spy.mockRestore();
  });

  test("Devrait renvoyer 500 si la DB échoue sur PATCH /:id/status", async () => {
    const spy = jest.spyOn(db, "run").mockImplementation((sql, params, cb) => {
      cb(new Error("Erreur DB simulée"));
    });

    const response = await request(app)
      .patch("/api/orders/1/status")
      .send({ status: "shipped" });
    
    expect(response.status).toBe(500);
    spy.mockRestore();
  });

  afterAll((done) => {
    done();
  });
});
