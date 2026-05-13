/* Rutas de blog_posts */

'use strict';

const { Router } = require('express');

const controller = require('./posts.controller');
const { createRules, updateRules } = require('./posts.validator');
const validate = require('../../../../../../middlewares/validate');
const authorize = require('../../../../../../middlewares/authorize');

const router = Router({ mergeParams: true });

router.get('/', authorize('project:read'), controller.getAll);
router.get('/:postId', authorize('project:read'), controller.getById);

router.post('/', authorize('project:update'), createRules, validate, controller.create);

router.patch('/:postId', authorize('project:update'), updateRules, validate, controller.update);

router.delete('/:postId', authorize('project:update'), controller.remove);

module.exports = router;
