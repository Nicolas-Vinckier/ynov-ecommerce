const express = require("express");
const router = express.Router();
const db = require("../db/index");

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         role:
 *           type: string
 *       example:
 *         id: 1
 *         name: Alice Martin
 *         email: alice@example.com
 *         role: customer
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: The users managing API
 */

// Feature flag dynamique pour les tests

// Helper to format users for V2
function formatUsersV2(users) {
  const data = users.reduce((acc, user) => {
    acc[user.email] = user;
    return acc;
  }, {});

  return {
    version: "v2",
    users: data,
  };
}

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Returns the list of all the users
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: The list of the users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
// GET /api/users
router.get("/", (req, res) => {
  const isV2 = process.env.FEATURE_V2_USERS === "true";
  db.all("SELECT * FROM users", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const data = isV2 ? formatUsersV2(rows) : rows;
    res.json(data);
  });
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get the user by id
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The user id
 *     responses:
 *       200:
 *         description: The user description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: The user was not found
 */
// GET /api/users/:id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(row);
  });
});

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: The user was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: name and email are required
 */
// POST /api/users
router.post("/", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: "name and email are required" });
  }
  
  const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
  const params = [name, email, password || "password123", "customer"];
  
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      name,
      email,
      role: "customer"
    });
  });
});

module.exports = router;
