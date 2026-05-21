/**
 * Pruebas unitarias para src/utils/AppError.js
 */

'use strict';

const AppError = require('../../../src/utils/AppError');
const HTTP_STATUS = require('../../../src/constants/httpStatus');

describe('AppError', () => {
  describe('Constructor con todos los argumentos', () => {
    test('debe crear una instancia con mensaje, statusCode y errores', () => {
      const errores = [{ field: 'email', message: 'Email inválido' }];
      const error = new AppError('Error de validación', HTTP_STATUS.UNPROCESSABLE_ENTITY, errores);

      expect(error.message).toBe('Error de validación');
      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual(errores);
      expect(error.isOperational).toBe(true);
    });

    test('debe ser una instancia de Error nativo', () => {
      const error = new AppError('Algo falló', 500);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AppError);
    });

    test('debe tener el nombre "AppError"', () => {
      const error = new AppError('Test');
      expect(error.name).toBe('AppError');
    });
  });

  describe('Valores por defecto', () => {
    test('statusCode debe ser 500 (INTERNAL_SERVER_ERROR) si no se especifica', () => {
      const error = new AppError('Error interno');
      expect(error.statusCode).toBe(HTTP_STATUS.INTERNAL_SERVER_ERROR);
    });

    test('errors debe ser null si no se especifica', () => {
      const error = new AppError('Sin errores de campo', 400);
      expect(error.errors).toBeNull();
    });
  });

  describe('Propiedad isOperational', () => {
    test('siempre debe ser true para errores operacionales conocidos', () => {
      const error400 = new AppError('Bad request', HTTP_STATUS.BAD_REQUEST);
      const error401 = new AppError('No autorizado', HTTP_STATUS.UNAUTHORIZED);
      const error404 = new AppError('No encontrado', HTTP_STATUS.NOT_FOUND);
      const error409 = new AppError('Conflicto', HTTP_STATUS.CONFLICT);

      expect(error400.isOperational).toBe(true);
      expect(error401.isOperational).toBe(true);
      expect(error404.isOperational).toBe(true);
      expect(error409.isOperational).toBe(true);
    });
  });

  describe('Stack trace', () => {
    test('debe incluir un stack trace válido', () => {
      const error = new AppError('Con stack', 500);
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('AppError');
    });

    test('el stack trace no debe apuntar al constructor de AppError', () => {
      // Error.captureStackTrace omite el constructor del stack
      const error = new AppError('Stack limpio', 400);
      const primeraLinea = error.stack.split('\n')[1];
      expect(primeraLinea).not.toContain('new AppError');
    });
  });

  describe('Compatibilidad con diferentes códigos HTTP', () => {
    const casos = [
      { nombre: 'BAD_REQUEST', codigo: HTTP_STATUS.BAD_REQUEST, esperado: 400 },
      { nombre: 'UNAUTHORIZED', codigo: HTTP_STATUS.UNAUTHORIZED, esperado: 401 },
      { nombre: 'FORBIDDEN', codigo: HTTP_STATUS.FORBIDDEN, esperado: 403 },
      { nombre: 'NOT_FOUND', codigo: HTTP_STATUS.NOT_FOUND, esperado: 404 },
      { nombre: 'CONFLICT', codigo: HTTP_STATUS.CONFLICT, esperado: 409 },
      { nombre: 'UNPROCESSABLE_ENTITY', codigo: HTTP_STATUS.UNPROCESSABLE_ENTITY, esperado: 422 },
      { nombre: 'TOO_MANY_REQUESTS', codigo: HTTP_STATUS.TOO_MANY_REQUESTS, esperado: 429 },
      { nombre: 'INTERNAL_SERVER_ERROR', codigo: HTTP_STATUS.INTERNAL_SERVER_ERROR, esperado: 500 },
    ];

    test.each(casos)(
      'debe aceptar el código $nombre ($esperado)',
      ({ codigo, esperado }) => {
        const error = new AppError('Test', codigo);
        expect(error.statusCode).toBe(esperado);
      }
    );
  });
});
