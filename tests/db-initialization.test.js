const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

describe("Tests d'initialisation de la base de données", () => {
  const testDbPath = path.resolve(__dirname, '../src/db/database.test-env.sqlite');

  // Nettoyage global avant de commencer
  beforeAll(() => {
    if (fs.existsSync(testDbPath)) {
      try { fs.unlinkSync(testDbPath); } catch (e) {}
    }
  });

  test("Devrait déclencher le seed si la base est neuve", (done) => {
    const originalResolve = path.resolve;
    
    jest.isolateModules(() => {
      const pathSpy = jest.spyOn(path, 'resolve').mockImplementation((...args) => {
        if (args[args.length - 1] === 'database.sqlite') return testDbPath;
        return originalResolve(...args);
      });

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      const db = require('../src/db/index');

      setTimeout(() => {
        try {
          expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("exécution du seed"));
          consoleSpy.mockRestore();
          pathSpy.mockRestore();
          
          db.close((err) => {
            if (fs.existsSync(testDbPath)) {
              try { fs.unlinkSync(testDbPath); } catch (e) {}
            }
            done(err);
          });
        } catch (e) {
          pathSpy.mockRestore();
          done(e);
        }
      }, 1000);
    });
  }, 10000);

  test("Devrait gérer l'erreur de connexion", (done) => {
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
        sqliteSpy.mockRestore();
        errorSpy.mockRestore();
        done(e);
      }
    });
  });
});
