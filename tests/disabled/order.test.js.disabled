const request = require("supertest");
const app = require("../src/index");

describe("Série de tests pour les commandes", () => {
  test("Devrait récupérer toutes les commandes", async () => {
    const response = await request(app).get("/api/orders");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });

  test("Devrait renvoyer 404 pour une commande inexistante", async () => {
    const response = await request(app).get("/api/orders/999");
    expect(response.status).toBe(404);
  });

  test("Devrait créer une commande avec succès", async () => {
    const response = await request(app)
      .post("/api/orders")
      .send({
        userId: 1,
        productIds: [1]
      });
    
    expect(response.status).toBe(201);
  });

  test("Devrait échouer à créer une commande si données manquantes", async () => {
    const response = await request(app)
      .post("/api/orders")
      .send({ userId: 1 });
    expect(response.status).toBe(400);
  });

  test("Devrait mettre à jour le statut d'une commande avec succès", async () => {
    const response = await request(app)
      .patch("/api/orders/1/status")
      .send({ status: "delivered" });
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("delivered");
  });

  test("Devrait échouer à mettre à jour avec un statut invalide", async () => {
    const response = await request(app)
      .patch("/api/orders/1/status")
      .send({ status: "invalid" });
    expect(response.status).toBe(400);
  });
});
