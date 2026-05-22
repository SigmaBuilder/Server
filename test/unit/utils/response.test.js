/**
 * Pruebas unitarias para src/utils/response.js
 *
 * Módulos testeados:
 *  - sendSuccess() — envía respuesta JSON con { success: true, data }.
 *  - sendError()   — envía respuesta JSON con { success: false, message, errors? }.
 */

'use strict';

const { sendSuccess, sendError } = require('../../../src/utils/response');

/**
 * Crea un mock del objeto res de Express con métodos encadenables.
 * @returns {{ status: jest.Mock, json: jest.Mock }}
 */
const crearResMock = () => {
  const res = {};
  res.json = jest.fn().mockReturnValue(res);
  res.status = jest.fn().mockReturnValue(res);
  return res;
};

describe('sendSuccess()', () => {
  test('debe responder con status 200 por defecto', () => {
    const res = crearResMock();
    sendSuccess(res, { usuario: 'test' });

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test('debe responder con el statusCode proporcionado', () => {
    const res = crearResMock();
    sendSuccess(res, { id: 1 }, 201);

    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('debe enviar JSON con success:true y los datos proporcionados', () => {
    const res = crearResMock();
    const datos = { proyecto: { id: 'abc', nombre: 'Test' } };
    sendSuccess(res, datos);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: datos,
    });
  });

  test('debe manejar data como null correctamente', () => {
    const res = crearResMock();
    sendSuccess(res, null, 204);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: null,
    });
  });

  test('debe manejar data como un array', () => {
    const res = crearResMock();
    const lista = [{ id: 1 }, { id: 2 }];
    sendSuccess(res, lista);

    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: lista,
    });
  });
});

describe('sendError()', () => {
  test('debe responder con status 500 por defecto', () => {
    const res = crearResMock();
    sendError(res, 'Error interno');

    expect(res.status).toHaveBeenCalledWith(500);
  });

  test('debe responder con el statusCode proporcionado', () => {
    const res = crearResMock();
    sendError(res, 'No encontrado', 404);

    expect(res.status).toHaveBeenCalledWith(404);
  });

  test('debe enviar JSON con success:false y el mensaje de error', () => {
    const res = crearResMock();
    sendError(res, 'Email ya en uso', 409);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Email ya en uso',
    });
  });

  test('debe incluir el array de errores cuando se proporciona', () => {
    const res = crearResMock();
    const errores = [
      { field: 'email', message: 'El email es obligatorio' },
      { field: 'password', message: 'Mínimo 8 caracteres' },
    ];
    sendError(res, 'Error de validación', 422, errores);

    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Error de validación',
      errors: errores,
    });
  });

  test('no debe incluir la clave "errors" cuando es null', () => {
    const res = crearResMock();
    sendError(res, 'Algo salió mal', 500, null);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).not.toHaveProperty('errors');
  });

  test('no debe incluir la clave "errors" cuando no se proporciona', () => {
    const res = crearResMock();
    sendError(res, 'Sin permisos', 403);

    const jsonArg = res.json.mock.calls[0][0];
    expect(jsonArg).not.toHaveProperty('errors');
  });
});
