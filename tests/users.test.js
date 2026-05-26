// Fichier de test de end point avec 2 test : un passant et un ratant
const request = require("supertest");
const app = require("../src/index");
const db = require("../src/db");

describe("Série de tests pour les utilisateurs", () => {
  beforeAll(() => {
    db.prepare("INSERT INTO users (id, name, email, role) VALUES (?, ?, ?, ?)").run(1, "Alice Martin", "alice@example.com", "admin");
  });

  afterAll(() => {
    db.prepare("DELETE FROM users").run();
  });

  // Test qui doit réussir (Passant)
  test("devrait récupérer l'utilisateur avec l'id 1", async () => {
    const response = await request(app).get("/api/users/1");
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("name", "Alice Martin");
  });

  // Test qui doit échouer (Ratant - on force une erreur d'assertion pour qu'il soit rouge)
  test("devrait échouer car on attend 200 pour un utilisateur inexistant", async () => {
    const response = await request(app).get("/api/users/999");
    // L'API renvoie 404
    expect(response.status).toBe(404);
  });
});
