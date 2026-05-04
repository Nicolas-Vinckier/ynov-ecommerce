const express = require("express");
const router = express.Router();
const db = require("../db/index");

/**
 * @swagger
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       required:
 *         - name
 *         - price
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the product
 *         name:
 *           type: string
 *           description: The name of the product
 *         description:
 *           type: string
 *           description: The product description
 *         price:
 *           type: number
 *           description: The price of the product
 *         stock:
 *           type: integer
 *           description: The quantity in stock
 *         category:
 *           type: string
 *           description: The product category
 *       example:
 *         id: 1
 *         name: Laptop
 *         description: A high-end gaming laptop
 *         price: 1200.00
 *         stock: 10
 *         category: electronics
 */

/**
 * @swagger
 * tags:
 *   name: Products
 *   description: The products managing API
 */

// Helper to format products for V2
function formatProductsV2(products) {
  return products.map((p) => ({
    ...p,
    available: p.stock > 0,
    priceFormatted: `€${p.price.toFixed(2)}`,
  }));
}

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Returns the list of all the products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: The list of the products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Product'
 */
// GET /api/products
router.get("/", (req, res) => {
  const isV2 = process.env.FEATURE_V2_PRODUCTS === "true";
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    const data = isV2 ? formatProductsV2(rows) : rows;
    res.json(data);
  });
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get the product by id
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: The product id
 *     responses:
 *       200:
 *         description: The product description by id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: The product was not found
 *       400:
 *         description: Product id must be a number
 */
// GET /api/products/:id
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Product id must be a number" });
  }
  db.get("SELECT * FROM products WHERE id = ?", [id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!row) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(row);
  });
});

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Product'
 *     responses:
 *       201:
 *         description: The product was successfully created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: name and price are required
 */
// POST /api/products
router.post("/", (req, res) => {
  const { name, description, price, stock } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: "name and price are required" });
  }
  
  const sql = "INSERT INTO products (name, description, price, stock) VALUES (?, ?, ?, ?)";
  const params = [name, description || "", price, stock ?? 0];
  
  db.run(sql, params, function (err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: this.lastID,
      name,
      description: description || "",
      price,
      stock: stock ?? 0
    });
  });
});

module.exports = router;
