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
const AppError = require('../../../utils/AppError');
const HTTP_STATUS = require('../../../constants/httpStatus');

const router = Router();

const multer = require('multer');
const AVATAR_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!AVATAR_MIME_TYPES.has(file.mimetype)) {
      cb(new AppError('Avatar must be a JPEG, PNG or WebP image', HTTP_STATUS.BAD_REQUEST));
      return;
    }

    cb(null, true);
  }
});

const handleAvatarUpload = (req, res, next) => {
  uploadAvatar.single('file')(req, res, (err) => {
    if (err?.code === 'LIMIT_FILE_SIZE') {
      next(new AppError('Avatar must be 2 MB or smaller', HTTP_STATUS.BAD_REQUEST));
      return;
    }

    next(err);
  });
};

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

router.post('/me/avatar', authenticate, handleAvatarUpload, controller.updateAvatar);
router.patch('/me/email',    authenticate, updateEmailRules, validate, controller.updateEmail);
router.patch('/me/password', authenticate, updatePasswordRules, validate, controller.updatePassword);
router.get('/sessions',    authenticate, controller.getSessions);
router.delete('/sessions/:id', authenticate, controller.deleteSession);

module.exports = router;
