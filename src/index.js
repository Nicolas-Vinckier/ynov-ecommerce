require("dotenv").config();
const express = require("express");


const productsRouter = require("./routes/products");
const ordersRouter = require("./routes/orders");
const usersRouter = require("./routes/users");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/api/products", productsRouter);
app.use("/api/orders", ordersRouter);
app.use("/api/users", usersRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start server if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log("-".repeat(50));
    console.log("Features flags:", {
      ...Object.keys(process.env)
        .filter((key) => key.startsWith("FEATURE_"))
        .reduce((acc, key) => {
          acc[key] = process.env[key];

          return acc;
        }, {}),
    });
  });
}

module.exports = app;
