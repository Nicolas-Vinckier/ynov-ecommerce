// Fichier de test de end point avec 2 test : un passant et un ratant
const request = require("supertest");
const app = require("../src/index");

describe("Série de tests pour les utilisateurs", () => {
  // Test qui doit réussir (Passant)
  test("devrait récupérer l'utilisateur avec l'id 1", async () => {
    const response = await request(app).get("/api/users/1");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name", "Alice Martin");
  });

  // Test qui doit échouer (Ratant - on force une erreur d'assertion pour qu'il soit rouge)
  test("devrait échouer car on attend 200 pour un utilisateur inexistant", async () => {
    const response = await request(app).get("/api/users/999");
    // L'API renvoie 404, mais on demande 200 -> Le test va "Rater"
    expect(response.status).toBe(200);
  });
});
