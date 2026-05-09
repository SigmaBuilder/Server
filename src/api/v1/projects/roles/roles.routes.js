/* Rutas de roles. */

'use strict';

const { Router } = require('express');

const controller = require('./roles.controller');

const { createRoleRules, updateRoleRules, setPermissionsRules } = require('./roles.validator');

const validate      = require('../../../../middlewares/validate');
const authenticate  = require('../../../../middlewares/authenticate');

const router = Router({ mergeParams: true });

router.use(authenticate);

router.get('/permissions', controller.getAllPermissions);
router.get('/',  controller.getAll);
router.post('/', createRoleRules, validate, controller.create);

router.get('/:roleId',    controller.getOne);
router.patch('/:roleId',  updateRoleRules,    validate, controller.update);
router.delete('/:roleId', controller.remove);

router.get('/:roleId/permissions',   controller.getPermissions);
router.patch('/:roleId/permissions', setPermissionsRules, validate, controller.setPermissions);

module.exports = router;