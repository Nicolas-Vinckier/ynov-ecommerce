const request = require("supertest");
const app = require("../src/index");
const db = require("../src/db/index");

describe("Série de tests pour les utilisateurs (Intégration DB)", () => {
  let createdUserId;

  beforeAll((done) => {
    process.env.FEATURE_V2_USERS = "false";
    db.serialize(() => {
      db.run("DELETE FROM users", done);
    });
  });

  test("Devrait créer un utilisateur sans mot de passe (mot de passe par défaut)", async () => {
    const response = await request(app).post("/api/users").send({
      name: "Sans MDP",
      email: "nomdp@example.com",
    });
    expect(response.status).toBe(201);
  });

  test("Devrait créer un utilisateur avec succès", async () => {
    const response = await request(app).post("/api/users").send({
      name: "Jean Test",
      email: "jean.test@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeDefined();
    createdUserId = response.body.id;
    expect(response.body.name).toBe("Jean Test");
    expect(response.body.email).toBe("jean.test@example.com");
  });

  test("Devrait échouer à créer un utilisateur avec données manquantes", async () => {
    const response = await request(app).post("/api/users").send({
      name: "Incomplet"
      // email manquant
    });
    expect(response.status).toBe(400);
  });

  test("Devrait récupérer la liste des utilisateurs", async () => {
    const response = await request(app).get("/api/users");
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  test("Devrait tester le format V2 des utilisateurs", async () => {
    process.env.FEATURE_V2_USERS = "true";
    const response = await request(app).get("/api/users");
    expect(response.status).toBe(200);
    expect(response.body.version).toBe("v2");
    expect(response.body.users["jean.test@example.com"]).toBeDefined();
    process.env.FEATURE_V2_USERS = "false";
  });

  test("Devrait récupérer un utilisateur par son ID", async () => {
    const response = await request(app).get(`/api/users/${createdUserId}`);
    expect(response.status).toBe(200);
    expect(response.body.name).toBe("Jean Test");
  });

  test("Devrait renvoyer 404 pour un utilisateur inexistant", async () => {
    const response = await request(app).get("/api/users/999999");
    expect(response.status).toBe(404);
  });

  test("Devrait échouer à créer un utilisateur avec un email déjà existant", async () => {
    const response = await request(app).post("/api/users").send({
      name: "Double",
      email: "jean.test@example.com",
    });

    expect(response.status).toBe(500);
    expect(response.body.error).toBeDefined();
  });

  // --- TESTS POUR COUVERTURE 100% (SIMULATION ERREURS 500) ---

  test("Devrait renvoyer 500 si la DB échoue sur GET /", async () => {
    const spy = jest.spyOn(db, "all").mockImplementation((sql, params, cb) => {
      cb(new Error("Erreur DB simulée"), null);
    });
    const response = await request(app).get("/api/users");
    expect(response.status).toBe(500);
    spy.mockRestore();
  });

  test("Devrait renvoyer 500 si la DB échoue sur GET /:id", async () => {
    const spy = jest.spyOn(db, "get").mockImplementation((sql, params, cb) => {
      cb(new Error("Erreur DB simulée"), null);
    });
    const response = await request(app).get("/api/users/1");
    expect(response.status).toBe(500);
    spy.mockRestore();
  });

  test("Devrait renvoyer 500 si la DB échoue sur POST /", async () => {
    const spy = jest.spyOn(db, "run").mockImplementation((sql, params, cb) => {
      cb(new Error("Erreur DB simulée"));
    });
    const response = await request(app).post("/api/users").send({
      name: "Fail",
      email: "fail@example.com",
    });
    expect(response.status).toBe(500);
    spy.mockRestore();
  });
});
