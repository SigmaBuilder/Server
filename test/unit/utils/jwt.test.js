/**
 * Pruebas unitarias para src/utils/jwt.js
 *
 * Módulos testeados:
 *  - signAccessToken()    — firma un JWT de acceso de corta duración.
 *  - signRefreshToken()   — firma un JWT de actualización de larga duración.
 *  - verifyAccessToken()  — verifica y decodifica un JWT de acceso.
 *  - verifyRefreshToken() — verifica y decodifica un JWT de actualización.
 */

'use strict';

// Mockear el módulo de entorno ANTES de importar jwt.js
jest.mock('../../../src/config/env', () => ({
  jwt: {
    accessSecret: 'test-access-secret-key-super-segura',
    accessExpiresIn: '15m',
    refreshSecret: 'test-refresh-secret-key-super-segura',
    refreshExpiresIn: '7d',
  },
  isProduction: false,
}));

const jwt = require('jsonwebtoken');
const {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} = require('../../../src/utils/jwt');
const AppError = require('../../../src/utils/AppError');

describe('signAccessToken()', () => {
  test('debe devolver un string JWT válido', () => {
    const token = signAccessToken({ id: 'user-123', email: 'test@example.com' });

    expect(typeof token).toBe('string');
    // Un JWT tiene 3 partes separadas por puntos
    expect(token.split('.')).toHaveLength(3);
  });

  test('el payload decodificado debe contener id y email', () => {
    const payload = { id: 'user-abc', email: 'usuario@test.com' };
    const token = signAccessToken(payload);
    const decoded = jwt.decode(token);

    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
  });

  test('el token debe incluir expiración (claim exp)', () => {
    const token = signAccessToken({ id: '1', email: 'a@b.com' });
    const decoded = jwt.decode(token);

    expect(decoded).toHaveProperty('exp');
    expect(decoded).toHaveProperty('iat');
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });
});

describe('signRefreshToken()', () => {
  test('debe devolver un string JWT válido', () => {
    const token = signRefreshToken({ id: 'user-456' });

    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  test('el payload debe contener un jti (JWT ID) único', () => {
    const token = signRefreshToken({ id: 'user-789' });
    const decoded = jwt.decode(token);

    expect(decoded).toHaveProperty('jti');
    expect(typeof decoded.jti).toBe('string');
    expect(decoded.jti.length).toBeGreaterThan(0);
  });

  test('cada invocación debe generar un jti diferente', () => {
    const token1 = signRefreshToken({ id: 'user-1' });
    const token2 = signRefreshToken({ id: 'user-1' });
    const jti1 = jwt.decode(token1).jti;
    const jti2 = jwt.decode(token2).jti;

    expect(jti1).not.toBe(jti2);
  });

  test('el token debe incluir expiración (claim exp)', () => {
    const token = signRefreshToken({ id: 'user-1' });
    const decoded = jwt.decode(token);

    expect(decoded).toHaveProperty('exp');
  });
});

describe('verifyAccessToken()', () => {
  test('debe decodificar correctamente un token válido', () => {
    const payload = { id: 'user-verify', email: 'verify@test.com' };
    const token = signAccessToken(payload);
    const decoded = verifyAccessToken(token);

    expect(decoded.id).toBe(payload.id);
    expect(decoded.email).toBe(payload.email);
  });

  test('debe lanzar AppError con status 401 para un token inválido', () => {
    expect(() => verifyAccessToken('token-invalido-xyz')).toThrow(AppError);

    try {
      verifyAccessToken('token-corrupto');
    } catch (error) {
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('Invalid or expired access token');
    }
  });

  test('debe lanzar AppError para un token firmado con otro secreto', () => {
    const tokenAjeno = jwt.sign(
      { id: '1', email: 'a@b.com' },
      'otro-secreto-completamente-diferente',
      { expiresIn: '1h' }
    );

    expect(() => verifyAccessToken(tokenAjeno)).toThrow(AppError);
  });

  test('debe lanzar AppError para un token expirado', () => {
    // Crear un token que ya expiró (expiresIn negativo)
    const tokenExpirado = jwt.sign(
      { id: '1', email: 'expired@test.com' },
      'test-access-secret-key-super-segura',
      { expiresIn: '-1s' }
    );

    expect(() => verifyAccessToken(tokenExpirado)).toThrow(AppError);
  });
});

describe('verifyRefreshToken()', () => {
  test('debe decodificar correctamente un token de actualización válido', () => {
    const token = signRefreshToken({ id: 'user-refresh' });
    const decoded = verifyRefreshToken(token);

    expect(decoded.id).toBe('user-refresh');
    expect(decoded).toHaveProperty('jti');
  });

  test('debe lanzar AppError con status 401 para un token inválido', () => {
    expect(() => verifyRefreshToken('refresh-invalido')).toThrow(AppError);

    try {
      verifyRefreshToken('basura');
    } catch (error) {
      expect(error.statusCode).toBe(401);
      expect(error.message).toContain('Invalid or expired refresh token');
    }
  });

  test('debe lanzar AppError para un refresh token firmado con el access secret', () => {
    // Un access token NO debe pasar como refresh token (secretos distintos)
    const accessToken = signAccessToken({ id: '1', email: 'test@test.com' });

    expect(() => verifyRefreshToken(accessToken)).toThrow(AppError);
  });

  test('debe lanzar AppError para un refresh token expirado', () => {
    const tokenExpirado = jwt.sign(
      { id: '1', jti: 'some-jti' },
      'test-refresh-secret-key-super-segura',
      { expiresIn: '-1s' }
    );

    expect(() => verifyRefreshToken(tokenExpirado)).toThrow(AppError);
  });
});
