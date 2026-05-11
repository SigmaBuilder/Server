/* Rutas de roles. */

'use strict';

const { Router } = require('express');

const controller = require('./roles.controller');

const { createRoleRules, updateRoleRules, setPermissionsRules } = require('./roles.validator');

const validate      = require('../../../../middlewares/validate');
const authenticate  = require('../../../../middlewares/authenticate');
const authorize     = require('../../../../middlewares/authorize');

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/permissions', authorize('roles:read'), controller.getAllPermissions);
router.get('/',  authorize('roles:read'), controller.getAll);
router.post('/', authorize('roles:manage'), createRoleRules, validate, controller.create);

router.get('/:roleId',    authorize('roles:read'), controller.getOne);
router.patch('/:roleId',  authorize('roles:manage'), updateRoleRules, validate, controller.update);
router.delete('/:roleId', authorize('roles:manage'), controller.remove);

router.get('/:roleId/permissions',   authorize('roles:read'), controller.getPermissions);
router.patch('/:roleId/permissions', authorize('roles:manage'), setPermissionsRules, validate, controller.setPermissions);

module.exports = router;