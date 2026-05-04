const express = require("express");
const router = express.Router();
const db = require("../db/index");

/**
 * @swagger
 * components:
 *   schemas:
 *     Order:
 *       type: object
 *       required:
 *         - userId
 *         - productIds
 *       properties:
 *         id:
 *           type: integer
 *         userId:
 *           type: integer
 *         productIds:
 *           type: array
 *           items:
 *             type: integer
 *         total:
 *           type: number
 *         status:
 *           type: string
 *           enum: [pending, shipped, delivered, cancelled]
 *         createdAt:
 *           type: string
 *           format: date
 *       example:
 *         id: 1
 *         userId: 1
 *         productIds: [1, 2]
 *         total: 150.00
 *         status: pending
 *         createdAt: "2024-05-04"
 */

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: The orders managing API
 */

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Returns the list of all the orders
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: The list of the orders
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Order'
 */
// GET /api/orders
router.get("/", (req, res) => {
  db.all("SELECT * FROM orders", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     summary: Get the order by id
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The order id
 *     responses:
 *       200:
 *         description: The order description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: The order was not found
 */
// GET /api/orders/:id
router.get("/:id", (req, res) => {
  const id = Number.parseInt(req.params.id);
  db.get("SELECT * FROM orders WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json(row);
  });
});

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Create a new order
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - productIds
 *             properties:
 *               userId:
 *                 type: integer
 *               productIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       201:
 *         description: The order was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       400:
 *         description: userId and productIds[] are required
 */
// POST /api/orders
router.post("/", (req, res) => {
  const { userId, total } = req.body;
  if (!userId || total === undefined) {
    return res
      .status(400)
      .json({ error: "userId and total are required" });
  }
  
  const sql = "INSERT INTO orders (user_id, total, status) VALUES (?, ?, ?)";
  const params = [userId, total, "pending"];
  
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      userId,
      total,
      status: "pending"
    });
  });
});

/**
 * @swagger
 * /api/orders/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The order id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, shipped, delivered, cancelled]
 *     responses:
 *       200:
 *         description: The order status was updated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Order'
 *       404:
 *         description: Order not found
 *       400:
 *         description: Invalid status
 */
// PATCH /api/orders/:id/status
router.patch("/:id/status", (req, res) => {
  const id = Number.parseInt(req.params.id);
  const { status } = req.body;
  const validStatuses = ["pending", "shipped", "delivered", "cancelled"];
  
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ error: `status must be one of: ${validStatuses.join(", ")}` });
  }
  
  db.run("UPDATE orders SET status = ? WHERE id = ?", [status, id], function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes === 0) {
      return res.status(404).json({ error: "Order not found" });
    }
    res.json({ id, status });
  });
});

module.exports = router;
