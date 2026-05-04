const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

describe("Tests d'initialisation de la base de données", () => {
  let tempDbPath;

  beforeEach(() => {
    jest.resetModules();
    // On génère un nom unique pour éviter les conflits de verrouillage
    tempDbPath = path.resolve(__dirname, `../src/db/database.test.${Date.now()}.${Math.random()}.sqlite`);
  });

  afterAll(() => {
    // On essaie de nettoyer, mais si c'est verrouillé, on laisse tomber (ce sont des fichiers temp)
    try {
      const files = fs.readdirSync(path.resolve(__dirname, '../src/db/'));
      files.forEach(file => {
        if (file.startsWith('database.test.') && file.endsWith('.sqlite')) {
          fs.unlinkSync(path.resolve(__dirname, '../src/db/', file));
        }
      });
    } catch (e) { /* ignore lock errors */ }
  });

  test("Devrait déclencher le seed si la base est neuve", (done) => {
    const originalResolve = path.resolve;
    const pathSpy = jest.spyOn(path, 'resolve').mockImplementation((...args) => {
      if (args[args.length - 1] === 'database.sqlite') return tempDbPath;
      return originalResolve(...args);
    });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    const db = require('../src/db/index');

    setTimeout(() => {
      try {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("exécution du seed"));
        consoleSpy.mockRestore();
        pathSpy.mockRestore();
        done();
      } catch (e) {
        pathSpy.mockRestore();
        done(e);
      }
    }, 500);
  });

  test("Devrait gérer l'erreur de connexion", (done) => {
    // On mock sqlite3 pour renvoyer une erreur
    const sqliteSpy = jest.spyOn(sqlite3, 'Database').mockImplementation((path, callback) => {
      callback(new Error("Erreur fatale simulée"));
      return { on: () => {} };
    });

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    jest.isolateModules(() => {
      require('../src/db/index');
      try {
        expect(errorSpy).toHaveBeenCalledWith(
          expect.stringContaining('Erreur lors de la connexion'),
          'Erreur fatale simulée'
        );
        sqliteSpy.mockRestore();
        errorSpy.mockRestore();
        done();
      } catch (e) {
        done(e);
      }
    });
  });
});
