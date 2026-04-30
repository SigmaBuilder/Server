/* Archivo responsable de manejar las rutas no encontradas */

'use strict';

const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Maneja las rutas no encontradas.
 * Debe ser registrado DESPUÉS de todas las rutas válidas pero ANTES de errorHandler.
 * 
 * @param {express.Request} req - Objeto de solicitud.
 * @param {express.Response} res - Objeto de respuesta.
 * @param {express.NextFunction} next - Función para pasar el control al siguiente middleware.
 */
const notFound = (req, _res, next) => {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, HTTP_STATUS.NOT_FOUND));
};

module.exports = notFound;