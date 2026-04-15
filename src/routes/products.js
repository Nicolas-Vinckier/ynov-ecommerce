const express = require('express');
const router = express.Router();
const products = require('../data/products');

const FEATURE_V2_PRODUCTS = process.env.FEATURE_V2_PRODUCTS === 'true';

function getProductsV1() {
  return products;
}

function getProductsV2() {
  return products.map(p => ({
    ...p,
    available: p.stock > 0,
    priceFormatted: `€${p.price.toFixed(2)}`,
  }));
}

// GET /api/products
router.get('/', (req, res) => {
  const data = FEATURE_V2_PRODUCTS ? getProductsV2() : getProductsV1();
  res.json(data);
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const product = products.find(p => p.id === id);
  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }
  res.json(product);
});

// POST /api/products
router.post('/', (req, res) => {
  const { name, price, stock, category } = req.body;
  if (!name || price === undefined) {
    return res.status(400).json({ error: 'name and price are required' });
  }
  const newProduct = {
    id: products.length + 1,
    name,
    price,
    stock: stock ?? 0,
    category: category ?? 'misc',
  };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

module.exports = router;
// product search stub
// wip search logic
// fixed typo in search
