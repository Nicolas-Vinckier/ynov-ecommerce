const request = require("supertest");
const app = require("../src/index");
const db = require("../src/db/index");

describe("Série de tests pour les produits (Intégration DB)", () => {
  beforeAll((done) => {
    const checkReady = () => {
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='products'", (err, row) => {
        if (row) {
          db.serialize(() => {
            db.run("DELETE FROM products", done);
          });
        } else {
          setTimeout(checkReady, 100);
        }
      });
    };
    checkReady();
  });

  test("Devrait créer un produit avec succès", async () => {
    const response = await request(app).post("/api/products").send({
      name: "Produit de Test",
      description: "Une description de test",
      price: 49.99,
      stock: 10,
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe("Produit de Test");
    expect(response.body.price).toBe(49.99);
  });

  test("Devrait créer un produit avec des valeurs par défaut (sans description ni stock)", async () => {
    const response = await request(app).post("/api/products").send({
      name: "Produit Minimal",
      price: 5.0,
    });
    expect(response.status).toBe(201);
    expect(response.body.description).toBe(""); // Valeur par défaut
    expect(response.body.stock).toBe(0); // Valeur par défaut
  });

  test("Devrait échouer à créer un produit avec données manquantes", async () => {
    const response = await request(app).post("/api/products").send({
      name: "Incomplet",
    });
    expect(response.status).toBe(400);
  });

  test("Devrait récupérer la liste des produits", async () => {
    const response = await request(app).get("/api/products");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("Devrait tester le format V2 des produits", async () => {
    process.env.FEATURE_V2_PRODUCTS = "true";
    const response = await request(app).get("/api/products");
    expect(response.status).toBe(200);
    expect(response.body[0].priceFormatted).toBeDefined();
    expect(response.body[0].available).toBeDefined();
    process.env.FEATURE_V2_PRODUCTS = "false"; // On remet à l'état initial
  });

  test("Devrait récupérer un produit spécifique par son ID", async () => {
    const resCreate = await request(app).post("/api/products").send({
      name: "Produit Unique",
      price: 10.0,
      stock: 5,
    });
    const productId = resCreate.body.id;

    const response = await request(app).get(`/api/products/${productId}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Produit Unique");
  });

  test("Devrait renvoyer 400 si l'ID n'est pas un nombre", async () => {
    const response = await request(app).get("/api/products/not-a-number");
    expect(response.status).toBe(400);
  });

  test("Devrait renvoyer 404 pour un produit inexistant", async () => {
    const response = await request(app).get("/api/products/999999");
    expect(response.status).toBe(404);
  });

  // --- TESTS POUR COUVERTURE 100% (SIMULATION ERREURS 500) ---

  test("Devrait renvoyer 500 si la DB échoue sur GET /", async () => {
    const spy = jest.spyOn(db, "all").mockImplementation((sql, params, cb) => {
      cb(new Error("Erreur DB simulée"), null);
    });
    const response = await request(app).get("/api/products");
    expect(response.status).toBe(500);
    spy.mockRestore();
  });

  test("Devrait renvoyer 500 si la DB échoue sur GET /:id", async () => {
    const spy = jest.spyOn(db, "get").mockImplementation((sql, params, cb) => {
      cb(new Error("Erreur DB simulée"), null);
    });
    const response = await request(app).get("/api/products/1");
    expect(response.status).toBe(500);
    spy.mockRestore();
  });

  test("Devrait renvoyer 500 si la DB échoue sur POST /", async () => {
    const spy = jest.spyOn(db, "run").mockImplementation((sql, params, cb) => {
      cb(new Error("Erreur DB simulée"));
    });
    const response = await request(app).post("/api/products").send({
      name: "Fail",
      price: 10,
    });
    expect(response.status).toBe(500);
    spy.mockRestore();
  });
});
