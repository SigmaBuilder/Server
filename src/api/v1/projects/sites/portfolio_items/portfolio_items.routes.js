/* Rutas de portfolio_items */

'use strict';

const { Router } = require('express');

const controller = require('./portfolio_items.controller');

const { createRules, updateRules } = require('./portfolio_items.validator');

const validate = require('../../../../../middlewares/validate');
const authorize = require('../../../../../middlewares/authorize');

const router = Router({ mergeParams: true });

router.get('/', authorize('project:read'), controller.getAll);
router.get('/:id', authorize('project:read'), controller.getById);

router.post('/', authorize('project:update'), createRules, validate, controller.create);

router.patch('/:id', authorize('project:update'), updateRules, validate, controller.update);

router.delete('/:id', authorize('project:update'), controller.remove);

module.exports = router;