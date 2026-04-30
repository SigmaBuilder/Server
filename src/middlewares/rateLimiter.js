/* Archivo responsable de limitar las peticiones por IP */

'use strict';

const rateLimit = require('express-rate-limit');
const { sendError } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpStatus');
const env = require('../config/env');

/**
 * Crea un middleware limitador de peticiones configurable.
 *
 * @param {object} [options] - Opciones del limitador.
 * @param {number} [options.windowMs] - Tiempo en milisegundos para resetear el contador.
 * @param {number} [options.max] - Número máximo de peticiones por ventana.
 * @param {string} [options.message] - Mensaje a enviar cuando se excede el límite.
 * @returns {import('express').RequestHandler} - Middleware limitador de peticiones.
 */
const createRateLimiter = (options = {}) =>
  rateLimit({
    windowMs: options.windowMs ?? env.rateLimit.windowMs,
    max: options.max ?? env.rateLimit.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) =>
      sendError(
        res,
        options.message ?? 'Too many requests, please try again later.',
        HTTP_STATUS.TOO_MANY_REQUESTS,
      ),
  });

/**
 * Limitador estricto para rutas de autenticación sensibles (login, register, refresh).
 * 
 * @type {import('express').RequestHandler}
 */
const authRateLimiter = createRateLimiter({
  windowMs: env.rateLimit.windowMs,
  max: env.rateLimit.max,
  message: 'Too many authentication attempts. Please try again later.',
});

module.exports = { createRateLimiter, authRateLimiter };