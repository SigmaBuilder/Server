/* Lógica de negocio para la autenticación. */

'use strict';

const db           = require('../../../config/db');
const { signAccessToken } = require('../../../utils/jwt');
const refreshTokenService  = require('../../../services/refreshToken.service');
const { sha256 }   = require('../../../utils/hash');
const bcrypt       = require('bcryptjs');
const AppError     = require('../../../utils/AppError');
const HTTP_STATUS  = require('../../../constants/httpStatus');

const BCRYPT_ROUNDS = 12;

/**
 * Extrae metadatos opcionales de la petición para la auditoría de tokens.
 * @param {import('express').Request} req
 * @returns {{ userAgent: string, ipAddress: string }}
 */
const extractMeta = (req) => ({
  userAgent: req.headers['user-agent'] ?? null,
  ipAddress: req.ip ?? null,
});

/**
 * Registra un nuevo usuario y emite tokens.
 * @param {{ email: string, password: string, first_name: string, last_name: string }} dto - Datos del usuario.
 * @param {object} meta - Metadatos de la petición (userAgent, ipAddress).
 * @returns {Promise<{ accessToken: string, rawRefreshToken: string, user: object }>}
 */
const register = async ({ email, password, first_name, last_name }, meta) => {
  // 1. Verifica que el email no esté en uso
  const existing = await db('users').where({ email }).first();
  if (existing) {
    throw new AppError('Email already in use', HTTP_STATUS.CONFLICT);
  }

  // 2. Genera hash de la contraseña
  const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

  // 3. Inserta el usuario
  const [user] = await db('users')
    .insert({ email, password_hash, first_name, last_name })
    .returning(['id', 'email', 'first_name', 'last_name', 'created_at']);

  if (!user) {
    throw new AppError('Failed to create user', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  // 4. Emite los tokens
  const accessToken = signAccessToken({ id: user.id, email: user.email });
  const { rawToken: rawRefreshToken } = await refreshTokenService.create(user.id, meta);

  return {
    accessToken,
    rawRefreshToken,
    user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
  };
};

/**
 * Loguea un usuario.
 * @param {{ email: string, password: string }} dto - Datos del usuario.
 * @param {object} meta - Metadatos de la petición (userAgent, ipAddress).
 * @returns {Promise<{ accessToken: string, rawRefreshToken: string, user: object }>}
 */
const login = async ({ email, password }, meta) => {
  // 1. Fetch user (include password_hash)
  const user = await db('users')
    .where({ email, is_active: true })
    .select('id', 'email', 'password_hash', 'first_name', 'last_name', 'avatar_url')
    .first();

  if (!user) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  // 2. Verifica la contraseña
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new AppError('Invalid email or password', HTTP_STATUS.UNAUTHORIZED);
  }

  // 3. Emite los tokens
  const accessToken = signAccessToken({ id: user.id, email: user.email });
  const { rawToken: rawRefreshToken } = await refreshTokenService.create(user.id, meta);

  return {
    accessToken,
    rawRefreshToken,
    user: {
      id:         user.id,
      email:      user.email,
      first_name: user.first_name,
      last_name:  user.last_name,
      avatar_url: user.avatar_url,
    },
  };
};

/**
 * Rotaciona el refresh token y emite un nuevo access token.
 * @param {string} rawRefreshToken - Refresh token crudo.
 * @param {object} meta - Metadatos de la petición (userAgent, ipAddress).
 * @returns {Promise<{ accessToken: string, rawRefreshToken: string }>}
 */
const refresh = async (rawRefreshToken, meta) => {
  // verify() verifica la validez del JWT, la búsqueda en la base de datos, la detección de ataques de reutilización y la caducidad.
  const { record } = await refreshTokenService.verify(rawRefreshToken);

  // Obtiene el email del usuario
  const authUser = await db('users').where({ id: record.user_id }).select('email').first();
  const email = authUser?.email ?? '';

  // Rotaciona el refresh token
  const { rawToken: newRawRefreshToken } = await refreshTokenService.rotate(
    record.id,
    record.user_id,
    record.family,
    meta,
  );

  const accessToken = signAccessToken({ id: record.user_id, email });

  return { accessToken, rawRefreshToken: newRawRefreshToken };
};

/**
 * Revoca el refresh token de la sesión actual.
 * @param {string} rawRefreshToken - Refresh token crudo.
 */
const logout = async (rawRefreshToken) => {
  if (!rawRefreshToken) return;
  const tokenHash = sha256(rawRefreshToken);

  const record = await db('refresh_tokens').where({ token_hash: tokenHash }).select('id').first();
  if (record) await refreshTokenService.revokeById(record.id);
};

/**
 * Revoca TODOS los refresh tokens del usuario (logout de todas las sesiones).
 * @param {string} userId - ID del usuario.
 */
const logoutAll = async (userId) => {
  await refreshTokenService.revokeAllForUser(userId);
};

/**
 * Retorna el perfil completo del usuario autenticado, incluyendo sus proyectos.
 * @param {string} userId - ID del usuario.
 */
const getMe = async (userId) => {
  const user = await db('users')
    .where('users.id', userId)
    .select('users.id', 'users.email', 'users.first_name', 'users.last_name', 'users.avatar_url', 'users.created_at')
    .first();

  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  // Obtiene las membresías del proyecto con rol y detalles del proyecto
  const memberships = await db('project_members as pm')
    .join('projects as p', 'p.id', 'pm.project_id')
    .leftJoin('roles as r', 'r.id', 'pm.role_id')
    .where('pm.user_id', userId)
    .select(
      'pm.created_at as joined_at',
      'r.id as role_id',
      'r.name as role_name',
      'p.id as project_id',
      'p.name as project_name',
      'p.description as project_description',
      'p.created_at as project_created_at',
    );

  return {
    ...user,
    projects: memberships.map((m) => ({
      joined_at: m.joined_at,
      role:      m.role_id ? { id: m.role_id, name: m.role_name } : null,
      project:   {
        id:          m.project_id,
        name:        m.project_name,
        description: m.project_description,
        created_at:  m.project_created_at,
      },
    })),
  };
};

/**
 * Lista todas las sesiones activas del usuario autenticado.
 * @param {string} userId - ID del usuario.
 */
const getSessions = async (userId) => refreshTokenService.getActiveSessions(userId);

/**
 * Actualiza el perfil del usuario autenticado (nombre, apellidos, avatar).
 * @param {string} userId - ID del usuario.
 * @param {object} data - Datos a actualizar.
 */
const updateProfile = async (userId, data) => {
  const allowedUpdates = {};
  if (data.first_name !== undefined) allowedUpdates.first_name = data.first_name;
  if (data.last_name !== undefined) allowedUpdates.last_name = data.last_name;
  if (data.avatar_url !== undefined) allowedUpdates.avatar_url = data.avatar_url;

  if (Object.keys(allowedUpdates).length === 0) return null;

  const [updatedUser] = await db('users')
    .where({ id: userId })
    .update(allowedUpdates)
    .returning(['id', 'email', 'first_name', 'last_name', 'avatar_url', 'created_at']);

  if (!updatedUser) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  return updatedUser;
};

/**
 * Actualiza el correo electrónico del usuario.
 * @param {string} userId - ID del usuario.
 * @param {string} newEmail - Nuevo correo electrónico.
 */
const updateEmail = async (userId, newEmail) => {
  const existing = await db('users').where({ email: newEmail }).whereNot({ id: userId }).first();
  if (existing) {
    throw new AppError('El email ya está en uso', HTTP_STATUS.CONFLICT);
  }

  const [updatedUser] = await db('users')
    .where({ id: userId })
    .update({ email: newEmail })
    .returning(['id', 'email', 'first_name', 'last_name', 'avatar_url', 'created_at']);

  if (!updatedUser) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);
  return updatedUser;
};

/**
 * Actualiza la contraseña del usuario.
 * @param {string} userId - ID del usuario.
 * @param {string} currentPassword - Contraseña actual.
 * @param {string} newPassword - Nueva contraseña.
 */
const updatePassword = async (userId, currentPassword, newPassword) => {
  const user = await db('users').where({ id: userId }).select('password_hash').first();
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  const valid = await bcrypt.compare(currentPassword, user.password_hash);
  if (!valid) {
    throw new AppError('La contraseña actual es incorrecta', HTTP_STATUS.UNAUTHORIZED);
  }

  const password_hash = await bcrypt.hash(newPassword, BCRYPT_ROUNDS);
  await db('users').where({ id: userId }).update({ password_hash });
};

module.exports = {
  extractMeta, 
  register, 
  login, 
  refresh, 
  logout, 
  logoutAll, 
  getMe, 
  getSessions,
  updateProfile,
  updateEmail,
  updatePassword
};