/* Archivo para manejar autenticación. */

'use strict';

const { verifyAccessToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Autentica al usuario.
 * Extrae y verifica el token de acceso Bearer del encabezado Authorization.
 * Adjunta `req.user = { id, email, iat, exp }` en caso de éxito.
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
const authenticate = (req, _res, next) => {
  
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided', HTTP_STATUS.UNAUTHORIZED));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = authenticate;