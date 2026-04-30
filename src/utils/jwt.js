/* Archivo para manejar JWT. */

'use strict';

const jwt = require('jsonwebtoken');
const env = require('../config/env');
const AppError = require('./AppError');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Firma un token de acceso de corta duración.
 * @param {{ id: string, email: string }} payload
 * @returns {string} JWT firmado
 */
const signAccessToken = (payload) =>
  jwt.sign(payload, env.jwt.accessSecret, { expiresIn: env.jwt.accessExpiresIn });

/**
 * Firma un token de actualización de larga duración.
 * El token raw se almacena como un hash SHA-256 en la DB; el token en sí va en la cookie.
 * @param {{ id: string }} payload
 * @returns {string} JWT firmado
 */
const signRefreshToken = (payload) =>
  jwt.sign(payload, env.jwt.refreshSecret, { expiresIn: env.jwt.refreshExpiresIn });

/**
 * Verifica y decodifica un token de acceso.
 * @param {string} token - Token de acceso a verificar.
 * @returns {object} Payload decodificado.
 * @throws {AppError} 401 si el token es inválido o expirado.
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.accessSecret);
  } catch (err) {
    throw new AppError('Invalid or expired access token', HTTP_STATUS.UNAUTHORIZED);
  }
};

/**
 * Verifica y decodifica un token de actualización.
 * @param {string} token - Token de actualización a verificar.
 * @returns {object} Payload decodificado.
 * @throws {AppError} 401 si el token es inválido o expirado.
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, env.jwt.refreshSecret);
  } catch (err) {
    throw new AppError('Invalid or expired refresh token', HTTP_STATUS.UNAUTHORIZED);
  }
};

module.exports = { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken };