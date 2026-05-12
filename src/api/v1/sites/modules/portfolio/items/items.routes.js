/* Rutas de portfolio_items */

'use strict';

const { Router } = require('express');

const controller = require('./items.controller');

const { createRules, updateRules } = require('./items.validator');

const validate = require('../../../../../../middlewares/validate');
const authorize = require('../../../../../../middlewares/authorize');

const router = Router({ mergeParams: true });

router.get('/', authorize('project:read'), controller.getAll);
router.get('/:itemId', authorize('project:read'), controller.getById);

router.post('/', authorize('project:update'), createRules, validate, controller.create);

router.patch('/:itemId', authorize('project:update'), updateRules, validate, controller.update);

router.delete('/:itemId', authorize('project:update'), controller.remove);

module.exports = router;