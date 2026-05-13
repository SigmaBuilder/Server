/* Validadores de portfolio_stack */

'use strict'

const { body } = require('express-validator');

const createRules = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .trim(),
  body('icon_url')
    .optional()
    .isURL()
];

const updateRules = [
  body('name')
    .optional()
    .isString()
    .trim(),
  body('icon_url')
    .optional()
    .isURL()
];

module.exports = {
  createRules,
  updateRules,
};