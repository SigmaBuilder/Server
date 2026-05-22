/* Archivo responsable de manejar los errores */

'use strict';

const logger = require('../utils/logger');
const { sendError } = require('../utils/response');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Maneja los errores de la aplicación.
 * Debe ser el ÚLTIMO middleware registrado en app.js.
 * 
 * @param {Error} err - Error que se va a manejar, puede ser una instancia de AppError.
 * @param {express.Request} req - Objeto de solicitud.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Función para pasar el control al siguiente middleware.
 */
const errorHandler = (err, req, res, next) => {
  // Errores operativos (AppError): se puede exponer el mensaje al cliente
  if (err.isOperational) {
    logger.warn(err.message, { statusCode: err.statusCode, path: req.path });
    return sendError(res, err.message, err.statusCode, err.errors ?? null);
  }

  // Errores inesperados de programación: se registra la pila completa y se devuelve un mensaje genérico
  logger.error('Unhandled error', { message: err.message, stack: err.stack, path: req.path });

  // En producción, devuelve un mensaje genérico para evitar exponer detalles internos
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message;

  return sendError(res, message, HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

module.exports = errorHandler;