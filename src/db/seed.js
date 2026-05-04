const db = require("./index");

const seedData = (callback) => {
  db.serialize(() => {
    // Création de la table users
    db.run(`CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'customer'
    )`);

    // Création de la table products
    db.run(`CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      stock INTEGER NOT NULL
    )`);

    // Création de la table orders
    db.run(`CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      total REAL NOT NULL,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    console.log("Tables vérifiées/créées avec succès.");
    if (callback) {callback();}
  });
};

// Si le fichier est exécuté directement
if (require.main === module) {
  seedData(() => {
    db.close((err) => {
      if (err) {
        console.error("Erreur lors de la fermeture :", err.message);
      } else {
        console.log("Connexion fermée.");
      }
    });
  });
}

module.exports = seedData;
