/* Validadores de rutas de roles. */

'use strict';

const { body } = require('express-validator');

const createRoleRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Role name is required'),
  body('description')
    .optional()
    .trim(),
  body('permissionIds')
    .optional()
    .isArray()
    .withMessage('permissionIds must be an array'),
  body('permissionIds.*')
    .optional()
    .isUUID()
    .withMessage('Each permissionId must be a valid UUID'),
];

const updateRoleRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('description')
    .optional()
    .trim(),
];

const setPermissionsRules = [
  body('permissionIds')
    .isArray()
    .withMessage('permissionIds must be an array'),
  body('permissionIds.*')
    .isUUID()
    .withMessage('Each permissionId must be a valid UUID'),
];

module.exports = {
  createRoleRules,
  updateRoleRules,
  setPermissionsRules,
};