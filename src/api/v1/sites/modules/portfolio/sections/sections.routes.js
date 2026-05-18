/* Rutas de portfolio_sections */

'use strict';

const { Router } = require('express');

const controller = require('./sections.controller');

const { createRules, updateRules } = require('./sections.validator');

const validate = require('../../../../../../middlewares/validate');
const authorize = require('../../../../../../middlewares/authorize');

const router = Router({ mergeParams: true });

router.get('/', authorize('project:read'), controller.getAll);
router.get('/:sectionId', authorize('project:read'), controller.getById);

router.post('/', authorize('project:update'), createRules, validate, controller.create);

router.patch('/:sectionId', authorize('project:update'), updateRules, validate, controller.update);

router.delete('/:sectionId', authorize('project:update'), controller.remove);

module.exports = router;