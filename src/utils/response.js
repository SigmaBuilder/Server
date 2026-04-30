/* Archivo para manejar respuestas. */

'use strict';

const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Envía una respuesta exitosa.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {number} [statusCode=200]
 */
const sendSuccess = (res, data, statusCode = HTTP_STATUS.OK) =>
  res.status(statusCode).json({ success: true, data });

/**
 * Envía una respuesta de error.
 * @param {import('express').Response} res
 * @param {string} message
 * @param {number} [statusCode=500]
 * @param {Array|null} [errors=null]
 */
const sendError = (res, message, statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errors = null) =>
  res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });

module.exports = { sendSuccess, sendError };