/* Validadores de blog_categories */

'use strict'

const { body } = require('express-validator');

const createRules = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isString()
    .trim(),
  body('slug')
    .notEmpty()
    .withMessage('Slug is required')
    .isString()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens (-)'),
];

const updateRules = [
  body('name')
    .optional()
    .isString()
    .trim(),
  body('slug')
    .optional()
    .isString()
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug must contain only lowercase letters, numbers, and hyphens (-)'),
];

module.exports = {
  createRules,
  updateRules,
};