/* Archivo responsable de validar las peticiones */

'use strict';

const { validationResult } = require('express-validator');

const { sendError } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Middleware para validar las peticiones
 * @param {Object} req - Objeto de petición
 * @param {Object} res - Objeto de respuesta
 * @param {Function} next - Función para continuar con la petición
 * @returns {Promise<void>}
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 'Validation failed', HTTP_STATUS.UNPROCESSABLE_ENTITY, errors.array());
  }
  next();
}

module.exports = validate;