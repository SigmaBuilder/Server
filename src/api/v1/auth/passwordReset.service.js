/* Servicio de restablecimiento de contraseña. */

'use strict';

const db = require('../../../config/db');
const { v4: uuidv4 } = require('uuid');
const { sha256 } = require('../../../utils/hash');
const bcrypt = require('bcryptjs');
const AppError = require('../../../utils/AppError');
const HTTP_STATUS = require('../../../constants/httpStatus');
const emailService = require('../../../services/email.service');
const env = require('../../../config/env');
const { revokeAllForUser } = require('../../../services/refreshToken.service');

const BCRYPT_ROUNDS = 12;
// 15 minutos en milisegundos
const RESET_TOKEN_EXPIRES_IN_MS = 15 * 60 * 1000;

/**
 * Solicita el restablecimiento de la contraseña para un correo electrónico dado.
 * @param {string} email - Correo del usuario.
 */
const requestPasswordReset = async (email) => {
  const user = await db('users')
    .where({ email, is_active: true })
    .select('id', 'first_name')
    .first();

  if (!user) {
    // Para evitar la enumeración de usuarios, no lanzamos error si el usuario no existe.
    // Simplemente no hacemos nada.
    return;
  }

  // Generamos el token
  const token = uuidv4();
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_IN_MS);

  // Lo insertamos en base de datos
  await db('password_reset_tokens').insert({
    user_id: user.id,
    token_hash: tokenHash,
    expires_at: expiresAt,
  });

  // Generamos URL para frontend
  const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;

  // Enviamos el correo
  await emailService.sendMail(
    email,
    'Restablece tu contraseña - SigmaBuilder',
    'forgot-password',
    {
      firstName: user.first_name,
      resetUrl,
      year: new Date().getFullYear(),
    }
  );
};

/**
 * Restablece la contraseña de un usuario a partir de su token.
 * @param {string} token - El token enviado al correo.
 * @param {string} newPassword - La nueva contraseña.
 */
const resetPassword = async (token, newPassword) => {
  const tokenHash = sha256(token);

  const record = await db('password_reset_tokens')
    .where({ token_hash: tokenHash })
    .first();

  if (!record) {
    throw new AppError('Invalid or expired reset token', HTTP_STATUS.BAD_REQUEST);
  }

  if (record.is_used) {
    throw new AppError('Reset token has already been used', HTTP_STATUS.BAD_REQUEST);
  }

  if (new Date(record.expires_at) < new Date()) {
    throw new AppError('Reset token has expired', HTTP_STATUS.BAD_REQUEST);
  }

  // Hash de la nueva contraseña
  const passwordHash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);

  // Actualizamos el usuario y marcamos el token como usado dentro de una transacción
  await db.transaction(async (trx) => {
    await trx('users')
      .where({ id: record.user_id })
      .update({ password_hash: passwordHash, updated_at: new Date() });

    await trx('password_reset_tokens')
      .where({ id: record.id })
      .update({ is_used: true });
      
    // Revoca todos los refresh tokens existentes para forzar re-login
    await revokeAllForUser(record.user_id);
  });
};

module.exports = {
  requestPasswordReset,
  resetPassword,
};
