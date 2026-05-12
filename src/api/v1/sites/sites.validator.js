/* Validadores de rutas globales de sites. */

'use strict';

const { body } = require('express-validator');

const updateSiteRules = [
  body('slug')
    .optional()
    .isString().withMessage('Site name must be a string')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Site slug must contain only lowercase letters, numbers, and hyphens (-)'),
  body('name')
    .optional()
    .isString().withMessage('Site name must be a string')
    .trim(),
  body('features')
    .optional()
    .isObject().withMessage('Features must be a JSON object'),
  body('content')
    .optional()
    .isObject().withMessage('Content must be a JSON object'),
];

module.exports = {
  updateSiteRules,
};