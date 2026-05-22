/* Validadores de rutas de projects. */

'use strict';

const { body } = require('express-validator');

const createProjectRules = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Project name is required'),
  body('description')
    .optional()
    .trim(),
];

const updateProjectRules = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty'),
  body('description')
    .optional()
    .trim(),
];

module.exports = {
  createProjectRules,
  updateProjectRules,
};