/* Validadores de rutas de members. */

'use strict';

const { body } = require('express-validator');

const addMemberRules = [
  body('userId')
    .isUUID()
    .withMessage('Valid userId (UUID) is required'),
  body('roleId')
    .isUUID()
    .withMessage('Valid roleId (UUID) is required'),
];

const updateMemberRules = [
  body('roleId')
    .isUUID()
    .withMessage('Valid roleId (UUID) is required'),
];

const inviteRules = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('roleId')
    .isUUID()
    .withMessage('Valid roleId (UUID) is required'),
];

module.exports = {
  addMemberRules,
  updateMemberRules,
  inviteRules
};