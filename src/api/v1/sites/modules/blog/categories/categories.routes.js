/* Rutas de blog_categories */

'use strict'

const { Router } = require('express');

const controller = require('./categories.controller');

const { createRules, updateRules } = require('./categories.validator');

const validate = require('../../../../../../middlewares/validate');
const authorize = require('../../../../../../middlewares/authorize');

const router = Router({ mergeParams: true });

router.get('/', authorize('project:read'), controller.getAll);
router.get('/:categoryId', authorize('project:read'), controller.getById);

router.post('/', authorize('project:update'), createRules, validate, controller.create);

router.patch('/:categoryId', authorize('project:update'), updateRules, validate, controller.update);

router.delete('/:categoryId', authorize('project:update'), controller.remove);

module.exports = router;