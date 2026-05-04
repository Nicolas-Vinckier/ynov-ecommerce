const request = require("supertest");
const app = require("../src/index");
const db = require("../src/db/index");

describe("Série de tests pour les produits (Intégration DB)", () => {
  beforeAll((done) => {
    db.serialize(() => {
      db.run("DELETE FROM products", done);
    });
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

  test("Devrait récupérer la liste des produits", async () => {
    const response = await request(app).get("/api/products");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("Devrait récupérer un produit spécifique par son ID", async () => {
    // On crée un produit d'abord pour être sûr de l'ID
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
});
