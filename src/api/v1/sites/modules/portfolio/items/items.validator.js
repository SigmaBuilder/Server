/* Validadores de portfolio_items */

'use strict';

const { body } = require('express-validator');

const createRules = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .trim(),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('image_url')
    .optional()
    .isURL(),
  body('live_url')
    .optional()
    .isURL(),
  body('repository_url')
    .optional()
    .isURL(),
  body('sort_order')
    .optional()
    .isInt()
];

const updateRules = [
  body('title')
    .optional()
    .isString()
    .trim(),
  body('description')
    .optional()
    .isString()
    .trim(),
  body('image_url')
    .optional()
    .isURL(),
  body('live_url')
    .optional()
    .isURL(),
  body('repository_url')
    .optional()
    .isURL(),
  body('sort_order')
    .optional()
    .isInt()
];

module.exports = {
  createRules,
  updateRules,
};
