/**
 * Pruebas unitarias para src/utils/pagination.js
 *
 * Módulos testeados:
 *  - getPaginationParams() — extrae y valida page, limit y search de la query string.
 *  - formatPaginatedResponse() — formatea los datos con metadatos de paginación.
 */

'use strict';

const { getPaginationParams, formatPaginatedResponse } = require('../../../src/utils/pagination');

describe('getPaginationParams()', () => {
  /**
   * Helper para crear un objeto req simulado con query params.
   */
  const crearReq = (query = {}) => ({ query });

  describe('Valores por defecto', () => {
    test('debe devolver page=1, limit=10 y search="" cuando no se pasa nada', () => {
      const resultado = getPaginationParams(crearReq());

      expect(resultado).toEqual({
        page: 1,
        limit: 10,
        search: '',
      });
    });

    test('debe devolver page=1 si el query param page no existe', () => {
      const resultado = getPaginationParams(crearReq({ limit: '5' }));
      expect(resultado.page).toBe(1);
    });

    test('debe devolver limit=10 si el query param limit no existe', () => {
      const resultado = getPaginationParams(crearReq({ page: '2' }));
      expect(resultado.limit).toBe(10);
    });
  });

  describe('Parseo correcto de valores', () => {
    test('debe parsear page y limit como enteros', () => {
      const resultado = getPaginationParams(crearReq({ page: '3', limit: '25' }));

      expect(resultado.page).toBe(3);
      expect(resultado.limit).toBe(25);
    });

    test('debe pasar el parámetro search tal cual (recortando espacios)', () => {
      const resultado = getPaginationParams(crearReq({ search: '  hola mundo  ' }));
      expect(resultado.search).toBe('hola mundo');
    });
  });

  describe('Validación de valores inválidos o negativos', () => {
    test('debe devolver page=1 si page es negativo', () => {
      const resultado = getPaginationParams(crearReq({ page: '-5' }));
      expect(resultado.page).toBe(1);
    });

    test('debe devolver page=1 si page es 0', () => {
      const resultado = getPaginationParams(crearReq({ page: '0' }));
      expect(resultado.page).toBe(1);
    });

    test('debe devolver limit=10 si limit es negativo', () => {
      const resultado = getPaginationParams(crearReq({ limit: '-1' }));
      expect(resultado.limit).toBe(10);
    });

    test('debe devolver limit=10 si limit es 0', () => {
      const resultado = getPaginationParams(crearReq({ limit: '0' }));
      expect(resultado.limit).toBe(10);
    });

    test('debe devolver page=1 si page es un texto no numérico', () => {
      const resultado = getPaginationParams(crearReq({ page: 'abc' }));
      expect(resultado.page).toBe(1);
    });

    test('debe devolver limit=10 si limit es un texto no numérico', () => {
      const resultado = getPaginationParams(crearReq({ limit: 'xyz' }));
      expect(resultado.limit).toBe(10);
    });
  });
});

describe('formatPaginatedResponse()', () => {
  test('debe devolver data y meta con la estructura correcta', () => {
    const datos = [{ id: 1 }, { id: 2 }];
    const resultado = formatPaginatedResponse(datos, 50, 1, 10);

    expect(resultado).toHaveProperty('data');
    expect(resultado).toHaveProperty('meta');
    expect(resultado.data).toBe(datos);
  });

  test('debe calcular totalPages correctamente', () => {
    // 50 elementos, 10 por página → 5 páginas
    const resultado = formatPaginatedResponse([], 50, 1, 10);
    expect(resultado.meta.totalPages).toBe(5);
  });

  test('debe redondear totalPages hacia arriba con Math.ceil', () => {
    // 51 elementos, 10 por página → 6 páginas (no 5)
    const resultado = formatPaginatedResponse([], 51, 1, 10);
    expect(resultado.meta.totalPages).toBe(6);
  });

  test('debe indicar hasNextPage=true cuando hay más páginas', () => {
    const resultado = formatPaginatedResponse([], 30, 1, 10);
    expect(resultado.meta.hasNextPage).toBe(true);
  });

  test('debe indicar hasNextPage=false en la última página', () => {
    const resultado = formatPaginatedResponse([], 30, 3, 10);
    expect(resultado.meta.hasNextPage).toBe(false);
  });

  test('debe indicar hasPrevPage=false en la primera página', () => {
    const resultado = formatPaginatedResponse([], 30, 1, 10);
    expect(resultado.meta.hasPrevPage).toBe(false);
  });

  test('debe indicar hasPrevPage=true a partir de la segunda página', () => {
    const resultado = formatPaginatedResponse([], 30, 2, 10);
    expect(resultado.meta.hasPrevPage).toBe(true);
  });

  test('debe devolver totalPages=0 cuando no hay datos (total=0)', () => {
    const resultado = formatPaginatedResponse([], 0, 1, 10);
    expect(resultado.meta.totalPages).toBe(0);
    expect(resultado.meta.hasNextPage).toBe(false);
  });

  test('debe incluir todos los campos esperados en meta', () => {
    const resultado = formatPaginatedResponse([{ id: 1 }], 100, 5, 20);

    expect(resultado.meta).toEqual({
      total: 100,
      page: 5,
      limit: 20,
      totalPages: 5,
      hasNextPage: false,
      hasPrevPage: true,
    });
  });
});
