/* Validadores de blog_posts */

'use strict';

const { body } = require('express-validator');

const createRules = [
  body('title')
    .notEmpty()
    .withMessage('Title is required')
    .isString()
    .trim(),
  body('slug')
    .notEmpty()
    .withMessage('Slug is required')
    .isString()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens (-)'),
  body('content')
    .notEmpty()
    .withMessage('Content is required')
    .isString(),
  body('category_id')
    .optional({ checkFalsy: true }) // Permite null o strings vacíos
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean value')
];

const updateRules = [
  body('title')
    .optional()
    .isString()
    .trim(),
  body('slug')
    .optional()
    .isString()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens (-)'),
  body('content')
    .optional()
    .isString(),
  body('category_id')
    .optional({ checkFalsy: true })
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  body('is_published')
    .optional()
    .isBoolean()
    .withMessage('is_published must be a boolean value')
];

module.exports = {
  createRules,
  updateRules,
};
