/* Rutas de proyectos. */

'use strict';

const { Router } = require('express');

const controller = require('./projects.controller');

const { createProjectRules, updateProjectRules } = require('./projects.validator');

const validate      = require('../../../middlewares/validate');
const authenticate  = require('../../../middlewares/authenticate');
const authorize     = require('../../../middlewares/authorize');

// Sub-rutas
const membersRouter = require('../members/members.routes');
const sitesRouter   = require('./sites/sites.routes');

const router = Router();

// Todas las rutas de proyectos requieren autenticación
router.use(authenticate);

router.get('/', controller.getAll);
router.post('/', createProjectRules, validate, controller.create);

router.get('/:projectId', authorize('project:read'), controller.getOne);
router.patch('/:projectId', authorize('project:update'), updateProjectRules, validate, controller.update);
router.delete('/:projectId', authorize('project:delete'), controller.remove);

// Delegar sub-rutas de miembros y sitios
router.use('/:projectId/members', membersRouter);
router.use('/:projectId/sites',   sitesRouter);

module.exports = router;