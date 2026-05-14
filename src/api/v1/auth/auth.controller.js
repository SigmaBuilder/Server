/* Controla las rutas de auth. */

'use strict';

const authService   = require('./auth.service');
const passwordResetService = require('./passwordReset.service');
const { sendSuccess } = require('../../../utils/response');
const HTTP_STATUS    = require('../../../constants/httpStatus');
const env            = require('../../../config/env');

/**
 * Opciones de cookies para el token de refresco HttpOnly.
 */
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000, 
  path: '/api/v1/auth',             
};

/**
 * Establece la cookie de refresco.
 * @param {object} res - Respuesta.
 * @param {string} token - Token de refresco.
 */
const setRefreshCookie = (res, token) => res.cookie('refreshToken', token, COOKIE_OPTIONS);
/**
 * Limpia la cookie de refresco.
 * @param {object} res - Respuesta.
 */
const clearRefreshCookie = (res) => res.clearCookie('refreshToken', COOKIE_OPTIONS);

/**
 * Extrae metadatos de la solicitud.
 * @param {object} req - Solicitud.
 */
const extractMeta = (req) => ({
  userAgent: req.headers['user-agent'] ?? null,
  ipAddress: req.ip ?? null,
});

/**
 * Registra un nuevo usuario.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const register = async (req, res, next) => {
  try {
    const { accessToken, rawRefreshToken, user } = await authService.register(req.body, extractMeta(req));
    setRefreshCookie(res, rawRefreshToken);
    sendSuccess(res, { accessToken, user }, HTTP_STATUS.CREATED);
  } catch (err) { next(err); }
};

/**
 * Inicia sesión de un usuario.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const login = async (req, res, next) => {
  try {
    const { accessToken, rawRefreshToken, user } = await authService.login(req.body, extractMeta(req));
    setRefreshCookie(res, rawRefreshToken);
    sendSuccess(res, { accessToken, user });
  } catch (err) { next(err); }
};

/**
 * Refresca el token de acceso.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const refresh = async (req, res, next) => {
  try {
    const rawToken = req.cookies?.refreshToken;
    const { accessToken, rawRefreshToken } = await authService.refresh(rawToken, extractMeta(req));
    setRefreshCookie(res, rawRefreshToken);
    sendSuccess(res, { accessToken });
  } catch (err) { next(err); }
};

/**
 * Cierra la sesión actual.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const logout = async (req, res, next) => {
  try {
    await authService.logout(req.cookies?.refreshToken);
    clearRefreshCookie(res);
    sendSuccess(res, null, HTTP_STATUS.NO_CONTENT);
  } catch (err) { next(err); }
};

/**
 * Cierra todas las sesiones del usuario.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const logoutAll = async (req, res, next) => {
  try {
    await authService.logoutAll(req.user.id);
    clearRefreshCookie(res);
    sendSuccess(res, null, HTTP_STATUS.NO_CONTENT);
  } catch (err) { next(err); }
};

/**
 * Obtiene el usuario actual.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const getMe = async (req, res, next) => {
  try {
    const user = await authService.getMe(req.user.id);
    sendSuccess(res, { user });
  } catch (err) { next(err); }
};

/**
 * Obtiene todas las sesiones del usuario.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const getSessions = async (req, res, next) => {
  try {
    const sessions = await authService.getSessions(req.user.id);
    sendSuccess(res, { sessions });
  } catch (err) { next(err); }
};

/**
 * Revoca una sesión específica.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const deleteSession = async (req, res, next) => {
  try {
    const { id } = req.params;
    await authService.deleteSession(req.user.id, id);
    sendSuccess(res, { message: 'Sesión cerrada correctamente' });
  } catch (err) { next(err); }
};

/**
 * Solicita restablecimiento de contraseña.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const forgotPassword = async (req, res, next) => {
  try {
    await passwordResetService.requestPasswordReset(req.body.email);
    // Devolvemos success sin indicar si el correo existe o no por seguridad
    sendSuccess(res, { message: 'If the email is registered, a reset link will be sent.' });
  } catch (err) { next(err); }
};

/**
 * Restablece la contraseña.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    await passwordResetService.resetPassword(token, newPassword);
    sendSuccess(res, { message: 'Password has been reset successfully.' });
  } catch (err) { next(err); }
};

/**
 * Actualiza el perfil del usuario.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await authService.updateProfile(req.user.id, req.body);
    sendSuccess(res, { user });
  } catch (err) { next(err); }
};

/**
 * Actualiza el correo electrónico del usuario.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const updateEmail = async (req, res, next) => {
  try {
    const user = await authService.updateEmail(req.user.id, req.body.email);
    sendSuccess(res, { user });
  } catch (err) { next(err); }
};

/**
 * Actualiza la contraseña del usuario.
 * @param {object} req - Solicitud.
 * @param {object} res - Respuesta.
 * @param {function} next - Siguiente middleware.
 */
const updatePassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    await authService.updatePassword(req.user.id, current_password, new_password);
    sendSuccess(res, { message: 'Contraseña actualizada correctamente' });
  } catch (err) { next(err); }
};

module.exports = {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  getSessions,
  deleteSession,
  forgotPassword,
  resetPassword,
  updateProfile,
  updateEmail,
  updatePassword
};