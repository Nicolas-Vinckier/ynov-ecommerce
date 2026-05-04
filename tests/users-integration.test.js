const request = require("supertest");
const app = require("../src/index");
const db = require("../src/db/index");

describe("Série de tests pour les utilisateurs (Intégration DB)", () => {
  beforeAll((done) => {
    db.serialize(() => {
      db.run("DELETE FROM users", done);
    });
  });

  test("Devrait créer un utilisateur avec succès", async () => {
    const response = await request(app).post("/api/users").send({
      name: "Jean Test",
      email: "jean.test@example.com",
      password: "password123",
    });

    if (response.status !== 201) {
      console.log("Error body:", response.body);
    }
    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    expect(response.body.name).toBe("Jean Test");
    expect(response.body.email).toBe("jean.test@example.com");
  });

  test("Devrait récupérer la liste des utilisateurs", async () => {
    const response = await request(app).get("/api/users");
    expect(response.status).toBe(200);
    // On gère le cas V2 (objet) vs V1 (array) si FEATURE_V2_USERS est actif
    if (process.env.FEATURE_V2_USERS === "true") {
      expect(response.body.version).toBe("v2");
      expect(typeof response.body.users).toBe("object");
    } else {
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
    }
  });

  test("Devrait échouer à créer un utilisateur avec un email déjà existant", async () => {
    // Premier utilisateur
    await request(app).post("/api/users").send({
      name: "Unique",
      email: "unique@example.com",
    });

    // Deuxième tentative avec le même email
    const response = await request(app).post("/api/users").send({
      name: "Double",
      email: "unique@example.com",
    });

    expect(response.status).toBe(500);
    expect(response.body.error).toBeDefined();
  });
});
