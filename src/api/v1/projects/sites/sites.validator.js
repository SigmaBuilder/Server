/* Validadores de rutas de sites. */

'use strict';

const { body } = require('express-validator');

const createSiteRules = [
  body('slug')
    .notEmpty().withMessage('Site slug is required')
    .isString().withMessage('Site slug must be a string')
    .trim()
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Site slug must contain only lowercase letters, numbers, and hyphens (-)'),
  body('name')
    .notEmpty().withMessage('Site name is required')
    .isString().withMessage('Site name must be a string')
    .trim(),
  body('templateType')
    .notEmpty().withMessage('Template type is required')
    .isString().withMessage('Template type must be a string'),
];

module.exports = {
  createSiteRules,
};