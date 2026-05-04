const request = require("supertest");
const app = require("../src/index");

describe("Série de tests pour les produits", () => {
  test("Devrait récupérer tous les produits", async () => {
    const response = await request(app).get("/api/products");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Devrait récupérer le produit avec l'id 1", async () => {
    const response = await request(app).get("/api/products/1");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name", "Laptop Pro 15");
  });

  test("Devrait renvoyer 404 pour un produit inexistant", async () => {
    const response = await request(app).get("/api/products/999");
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty("error");
  });

  test("Devrait renvoyer 400 si l'id du produit n'est pas un nombre", async () => {
    const response = await request(app).get("/api/products/abc");
    expect(response.status).toBe(400);
  });

  test("Devrait créer un produit avec succès", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({
        name: "Nouveau Produit",
        price: 19.99
      });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("Nouveau Produit");
  });

  test("Devrait échouer à créer un produit si le prix est manquant", async () => {
    const response = await request(app)
      .post("/api/products")
      .send({
        name: "Produit sans prix"
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("error");
  });
});
