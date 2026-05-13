/* Rutas de auth. */

'use strict';

const { Router } = require('express');

const controller = require('./auth.controller');

const {
  registerRules,
  loginRules,
  forgotPasswordRules,
  resetPasswordRules,
  updateProfileRules,
  updateEmailRules,
  updatePasswordRules
} = require('./auth.validator');

const validate = require('../../../middlewares/validate');
const authenticate = require('../../../middlewares/authenticate');
const { authRateLimiter } = require('../../../middlewares/rateLimiter');

const router = Router();

// Rutas públicas
router.post('/register', authRateLimiter, registerRules, validate, controller.register);
router.post('/login',    authRateLimiter, loginRules,    validate, controller.login);
router.post('/refresh',  authRateLimiter, controller.refresh);
router.post('/forgot-password', authRateLimiter, forgotPasswordRules, validate, controller.forgotPassword);
router.post('/reset-password', authRateLimiter, resetPasswordRules, validate, controller.resetPassword);

// Rutas protegidas
router.post('/logout',     authenticate, controller.logout);
router.post('/logout-all', authenticate, controller.logoutAll);
router.get('/me',          authenticate, controller.getMe);
router.patch('/me/profile',  authenticate, updateProfileRules, validate, controller.updateProfile);
router.patch('/me/email',    authenticate, updateEmailRules, validate, controller.updateEmail);
router.patch('/me/password', authenticate, updatePasswordRules, validate, controller.updatePassword);
router.get('/sessions',    authenticate, controller.getSessions);

module.exports = router;