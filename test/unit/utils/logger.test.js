/**
 * Pruebas unitarias para src/utils/logger.js
 *
 * Módulo testeado: logger — objeto con métodos error, warn, info, debug
 * que formatean mensajes con timestamp y nivel, y los envían a console.
 *
 * Estrategia de mocking:
 *  - Se mockea src/config/env para controlar isProduction.
 *  - Se espían los métodos de console para verificar que se llaman correctamente.
 *  - Se usa jest.isolateModules() para recargar el módulo con distintas configs.
 */

'use strict';

describe('logger', () => {
  let consoleSpy;

  beforeEach(() => {
    // Espiar todos los métodos de console
    consoleSpy = {
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      info: jest.spyOn(console, 'info').mockImplementation(() => {}),
      debug: jest.spyOn(console, 'debug').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    // Restaurar console después de cada test
    jest.restoreAllMocks();
    // Limpiar caché de módulos para poder recargar con diferente config
    jest.resetModules();
  });

  /**
   * Carga el logger con la configuración de entorno especificada.
   * Usa jest.isolateModules para obtener una instancia limpia.
   */
  const cargarLogger = (isProduction = false) => {
    let logger;
    jest.isolateModules(() => {
      jest.doMock('../../../src/config/env', () => ({
        isProduction,
      }));
      logger = require('../../../src/utils/logger');
    });
    return logger;
  };

  describe('Entorno de desarrollo (isProduction=false)', () => {
    test('logger.error() debe escribir en console.error', () => {
      const logger = cargarLogger(false);
      logger.error('Error de prueba');

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    test('logger.warn() debe escribir en console.warn', () => {
      const logger = cargarLogger(false);
      logger.warn('Advertencia de prueba');

      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
    });

    test('logger.info() debe escribir en console.info', () => {
      const logger = cargarLogger(false);
      logger.info('Información de prueba');

      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
    });

    test('logger.debug() debe escribir en console.debug en desarrollo', () => {
      const logger = cargarLogger(false);
      logger.debug('Depuración de prueba');

      expect(consoleSpy.debug).toHaveBeenCalledTimes(1);
    });
  });

  describe('Entorno de producción (isProduction=true)', () => {
    test('logger.error() debe escribir en console.error (siempre habilitado)', () => {
      const logger = cargarLogger(true);
      logger.error('Error crítico en producción');

      expect(consoleSpy.error).toHaveBeenCalledTimes(1);
    });

    test('logger.warn() debe escribir en console.warn (siempre habilitado)', () => {
      const logger = cargarLogger(true);
      logger.warn('Advertencia en producción');

      expect(consoleSpy.warn).toHaveBeenCalledTimes(1);
    });

    test('logger.info() debe escribir en console.info en producción', () => {
      const logger = cargarLogger(true);
      logger.info('Info en producción');

      expect(consoleSpy.info).toHaveBeenCalledTimes(1);
    });

    test('logger.debug() NO debe escribir en console.debug en producción', () => {
      const logger = cargarLogger(true);
      logger.debug('Esto no debería aparecer');

      expect(consoleSpy.debug).not.toHaveBeenCalled();
    });
  });

  describe('Formato del mensaje', () => {
    test('debe incluir un timestamp ISO en el mensaje', () => {
      const logger = cargarLogger(false);
      logger.info('Mensaje con timestamp');

      const salida = consoleSpy.info.mock.calls[0][0];
      // El formato es: [2026-05-21T...] [INFO] Mensaje con timestamp
      expect(salida).toMatch(/^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\]/);
    });

    test('debe incluir el nivel en mayúsculas', () => {
      const logger = cargarLogger(false);
      logger.error('Test nivel');

      const salida = consoleSpy.error.mock.calls[0][0];
      expect(salida).toContain('[ERROR]');
    });

    test('debe incluir el mensaje original', () => {
      const logger = cargarLogger(false);
      logger.warn('Mensaje importante de advertencia');

      const salida = consoleSpy.warn.mock.calls[0][0];
      expect(salida).toContain('Mensaje importante de advertencia');
    });

    test('debe incluir metadatos como JSON cuando se proporcionan', () => {
      const logger = cargarLogger(false);
      const meta = { userId: '123', action: 'login' };
      logger.info('Acción de usuario', meta);

      const salida = consoleSpy.info.mock.calls[0][0];
      expect(salida).toContain('"userId":"123"');
      expect(salida).toContain('"action":"login"');
    });

    test('no debe incluir metadatos cuando no se proporcionan', () => {
      const logger = cargarLogger(false);
      logger.info('Sin metadatos');

      const salida = consoleSpy.info.mock.calls[0][0];
      // Solo debe tener [timestamp] [INFO] Sin metadatos (sin JSON extra)
      expect(salida).not.toContain('{');
    });
  });
});
