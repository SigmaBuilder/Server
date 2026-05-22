/* Archivo para manejar hashes. */

'use strict';

const crypto = require('crypto');

/**
 * Devuelve el digest hexadecimal SHA-256 de la cadena dada.
 * Se utiliza para almacenar hashes de tokens de actualización en lugar de tokens raw.
 *
 * @param {string} value - Cadena raw del token.
 * @returns {string} Hash hexadecimal SHA-256.
 */
const sha256 = (value) => crypto.createHash('sha256').update(value).digest('hex');

module.exports = { sha256 };