const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

describe("Tests d'initialisation de la base de données", () => {
  const tempDbPath = path.resolve(__dirname, '../src/db/database.test.sqlite');

  beforeEach(() => {
    jest.resetModules();
    if (fs.existsSync(tempDbPath)) {
      fs.unlinkSync(tempDbPath);
    }
  });

  test("Devrait déclencher le seed si la base est neuve", (done) => {
    // On force le chemin vers un fichier temporaire
    jest.doMock('path', () => {
      const actualPath = jest.requireActual('path');
      return {
        ...actualPath,
        resolve: (...args) => {
          if (args[args.length - 1] === 'database.sqlite') return tempDbPath;
          return actualPath.resolve(...args);
        }
      };
    });

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    
    // On charge le module
    const db = require('../src/db/index');

    setTimeout(() => {
      try {
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining("exécution du seed"));
        consoleSpy.mockRestore();
        db.close(done);
      } catch (e) {
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
