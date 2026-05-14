/* Archivo responsable del servicio de tokens de refresco */

'use strict';

const db            = require('../config/db');
const { signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { sha256 }    = require('../utils/hash');
const AppError      = require('../utils/AppError');
const logger        = require('../utils/logger');
const HTTP_STATUS   = require('../constants/httpStatus');
const { v4: uuidv4 } = require('uuid');

/**
 * Extrae los milisegundos de expiración del token de refresco.
 * @returns {number} - Milisegundos de expiración.
 */
const getRefreshExpiresMs = () => {
  const env = require('../config/env');
  const raw = env.jwt.refreshExpiresIn;
  const match = raw.match(/^(\d+)([smhd])$/);
  if (!match) return 7 * 24 * 60 * 60 * 1000;
  const [, num, unit] = match;
  const multipliers = { s: 1000, m: 60000, h: 3_600_000, d: 86_400_000 };
  return parseInt(num, 10) * multipliers[unit];
};

/**
 * Crea y persiste un nuevo token de refresco.
 *
 * @param {string} userId - ID del usuario.
 * @param {{ userAgent?: string, ipAddress?: string, family?: string }} [meta={}] - Metadatos del token.
 * @returns {Promise<{ rawToken: string, tokenId: string }>}
 */
const create = async (userId, meta = {}) => {
  const family    = meta.family ?? uuidv4();
  const rawToken  = signRefreshToken({ id: userId });
  const tokenHash = sha256(rawToken);
  const expiresAt = new Date(Date.now() + getRefreshExpiresMs());

  const [record] = await db('refresh_tokens')
    .insert({
      user_id:    userId,
      token_hash: tokenHash,
      family,
      user_agent: meta.userAgent ?? null,
      ip_address: meta.ipAddress ?? null,
      expires_at: expiresAt,
    })
    .returning('id');

  if (!record) throw new AppError('Could not create refresh token', HTTP_STATUS.INTERNAL_SERVER_ERROR);

  return { rawToken, tokenId: record.id };
};

/**
 * Verifica un token de refresco crudo contra la base de datos.
 * Detecta ataques de reutilización a través del mecanismo de familia de tokens.
 *
 * @param {string} rawToken - Token de refresco crudo.
 * @returns {Promise<{ record: object, payload: object }>}
 * @throws {AppError}
 */
const verify = async (rawToken) => {
  // 1. Verificación criptográfica primero.
  const payload = verifyRefreshToken(rawToken);

  // 2. Buscar por hash.
  const tokenHash = sha256(rawToken);
  const record = await db('refresh_tokens').where({ token_hash: tokenHash }).first();

  if (!record) {
    throw new AppError('Refresh token not found', HTTP_STATUS.UNAUTHORIZED);
  }

  // 3. Detectar ataque de reutilización.
  if (record.is_revoked) {
    logger.warn('Refresh token reuse detected — revoking entire family', {
      userId: record.user_id,
      family: record.family,
    });
    await revokeFamily(record.family);
    throw new AppError('Refresh token already used. Please log in again.', HTTP_STATUS.UNAUTHORIZED);
  }

  // 4. Comprobar expiración.
  if (new Date(record.expires_at) < new Date()) {
    throw new AppError('Refresh token expired', HTTP_STATUS.UNAUTHORIZED);
  }

  // 5. Actualizar last_used_at.
  await db('refresh_tokens').where({ id: record.id }).update({ last_used_at: new Date() });

  return { record, payload };
};

/**
 * Rota un token de refresco: revoca el antiguo y crea uno nuevo en la misma familia.
 *
 * @param {string} oldTokenId - ID del token a revocar.
 * @param {string} userId - ID del usuario.
 * @param {string} family - Familia del token.
 * @param {{ userAgent?: string, ipAddress?: string }} [meta={}] - Metadatos del token.
 * @returns {Promise<{ rawToken: string, tokenId: string }>}
 */
const rotate = async (oldTokenId, userId, family, meta = {}) => {
  // Revocar token antiguo.
  await db('refresh_tokens').where({ id: oldTokenId }).update({ is_revoked: true });
  // Emitir nuevo token en la misma familia.
  return create(userId, { ...meta, family });
};

/**
 * Revoca un token de refresco específico por su ID.
 * @param {string} tokenId - ID del token.
 */
const revokeById = async (tokenId) => {
  await db('refresh_tokens').where({ id: tokenId }).update({ is_revoked: true });
};

/**
 * Revoca todos los tokens pertenecientes a una familia de tokens.
 * Se llama en la detección de ataques de reutilización.
 * @param {string} family - Familia del token.
 */
const revokeFamily = async (family) => {
  await db('refresh_tokens').where({ family }).update({ is_revoked: true });
};

/**
 * Revoca todos los tokens de refresco de un usuario (logout de todos los dispositivos).
 * @param {string} userId - ID del usuario.
 */
const revokeAllForUser = async (userId) => {
  await db('refresh_tokens')
    .where({ user_id: userId, is_revoked: false })
    .update({ is_revoked: true });
};

/**
 * Devuelve todas las sesiones activas de un usuario (no revocadas, no expiradas).
 * @param {string} userId - ID del usuario.
 * @returns {Promise<Array>}
 */
const getActiveSessions = async (userId) => {
  const sessions = await db('refresh_tokens')
    .where({ user_id: userId, is_revoked: false })
    .where('expires_at', '>', new Date())
    .select('id', 'user_agent', 'ip_address', 'created_at', 'last_used_at', 'expires_at')
    .orderBy('created_at', 'desc');

  if (!sessions) throw new AppError('Could not fetch sessions', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  return sessions;
};

module.exports = {
  create,
  verify,
  rotate,
  revokeById,
  revokeFamily,
  revokeAllForUser,
  getActiveSessions
};