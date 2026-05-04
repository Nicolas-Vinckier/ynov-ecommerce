const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');

describe("Tests d'initialisation de la base de données", () => {
  // On n'utilise plus beforeEach avec resetModules ici pour ne pas casser l'application globale

  test("Devrait déclencher le seed si la base est neuve", (done) => {
    const tempDbPath = path.resolve(__dirname, `../src/db/database.init-test.${Date.now()}.sqlite`);
    const originalResolve = path.resolve;
    
    // On isole ce test
    jest.isolateModules(() => {
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
  });

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
