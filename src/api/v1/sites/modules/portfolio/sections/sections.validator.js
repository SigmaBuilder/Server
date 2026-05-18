/* Validadores de portfolio_sections */

'use strict';

const { body } = require('express-validator');

const createRules = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .trim(),
  body('content')
    .optional()
    .isObject(),
  body('sort_order')
    .optional()
    .isInt()
];

const updateRules = [
  body('title')
    .optional()
    .isString()
    .trim(),
  body('content')
    .optional()
    .isObject(),
  body('sort_order')
    .optional()
    .isInt()
];

module.exports = {
  createRules,
  updateRules,
};