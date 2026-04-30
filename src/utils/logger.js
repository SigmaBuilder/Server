/* Archivo para manejar logs. */

'use strict';

const env = require('../config/env');

// Niveles de log
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const CURRENT_LEVEL = env.isProduction ? LEVELS.info : LEVELS.debug;

/**
 * Formatea el mensaje de log.
 * @param {*} level - Nivel de log.
 * @param {*} message - Mensaje de log.
 * @param {*} meta - Metadatos adicionales.
 * @returns {string} Mensaje de log formateado.
 */
const fmt = (level, message, meta) => {
  const ts = new Date().toISOString();
  const base = `[${ts}] [${level.toUpperCase()}] ${message}`;
  return meta ? `${base} ${JSON.stringify(meta)}` : base;
};

/**
 * Objeto con métodos para loggear mensajes en diferentes niveles.
 */
const logger = {
  error: (msg, meta) => LEVELS.error <= CURRENT_LEVEL && console.error(fmt('error', msg, meta)),
  warn:  (msg, meta) => LEVELS.warn  <= CURRENT_LEVEL && console.warn(fmt('warn', msg, meta)),
  info:  (msg, meta) => LEVELS.info  <= CURRENT_LEVEL && console.info(fmt('info', msg, meta)),
  debug: (msg, meta) => LEVELS.debug <= CURRENT_LEVEL && console.debug(fmt('debug', msg, meta)),
};

module.exports = logger;