/* Archivo para manejar errores. */

'use strict';

const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Clase para manejar errores.
 * Distingue entre errores operacionales (esperados) y de programación (inesperados).
 */
class AppError extends Error {
  /**
   * @param {string} message - Mensaje de error legible por humanos.
   * @param {number} statusCode - Código de estado HTTP.
   * @param {Array|null} errors - Errores de validación/campo opcionales.
   */
  constructor(message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) {
    super(message);
    this.name = 'AppError'; 
    this.statusCode = statusCode;
    this.isOperational = true;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;