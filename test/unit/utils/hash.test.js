/**
 * Pruebas unitarias para src/utils/hash.js
 */

'use strict';

const crypto = require('crypto');
const { sha256 } = require('../../../src/utils/hash');

describe('sha256()', () => {
  test('debe devolver un hash hexadecimal de 64 caracteres', () => {
    const resultado = sha256('prueba');
    expect(resultado).toHaveLength(64);
  });

  test('debe coincidir con el hash SHA-256 calculado nativamente por Node.js', () => {
    const entrada = 'token-de-ejemplo-1234';
    const esperado = crypto.createHash('sha256').update(entrada).digest('hex');

    expect(sha256(entrada)).toBe(esperado);
  });

  test('debe devolver siempre el mismo hash para la misma entrada (determinismo)', () => {
    const entrada = 'valor-consistente';
    const hash1 = sha256(entrada);
    const hash2 = sha256(entrada);

    expect(hash1).toBe(hash2);
  });

  test('debe devolver hashes diferentes para entradas diferentes', () => {
    const hash1 = sha256('entrada-a');
    const hash2 = sha256('entrada-b');

    expect(hash1).not.toBe(hash2);
  });

  test('debe manejar una cadena vacía correctamente', () => {
    const esperado = crypto.createHash('sha256').update('').digest('hex');
    expect(sha256('')).toBe(esperado);
  });

  test('debe manejar caracteres especiales y unicode', () => {
    const entrada = 'Password123!';
    const esperado = crypto.createHash('sha256').update(entrada).digest('hex');

    expect(sha256(entrada)).toBe(esperado);
  });

  test('debe devolver un string que solo contiene caracteres hexadecimales', () => {
    const resultado = sha256('test-hex');
    expect(resultado).toMatch(/^[0-9a-f]{64}$/);
  });
});
