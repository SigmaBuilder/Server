/* Archivo responsable de comprobar si un módulo está activo. */

'use strict';

const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Comprueba si un módulo está activo.
 * @param {string} moduleName - Nombre del módulo
 */
const checkModuleActive = (moduleName) => {
  return (req, res, next) => {
    const { features } = req.site;
    const modules = features?.modules || {};
    
    if (!modules[moduleName]) {
      return next(new AppError(`Module '${moduleName}' is not active for this site`, HTTP_STATUS.FORBIDDEN));
    }
    
    next();
  };
};

module.exports = checkModuleActive;
