/* Rutas de portfolio_stack */

'use strict'

const { Router } = require('express');

const controller = require('./stack.controller');

const { createRules, updateRules } = require('./stack.validator');

const validate = require('../../../../../../middlewares/validate');
const authorize = require('../../../../../../middlewares/authorize');

const router = Router({ mergeParams: true });

router.get('/', authorize('project:read'), controller.getAll);
router.get('/:stackId', authorize('project:read'), controller.getById);

router.post('/', authorize('project:update'), createRules, validate, controller.create);

router.patch('/:stackId', authorize('project:update'), updateRules, validate, controller.update);

router.delete('/:stackId', authorize('project:update'), controller.remove);

module.exports = router;