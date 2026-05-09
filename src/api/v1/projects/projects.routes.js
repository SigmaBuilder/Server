/* Rutas de proyectos. */

'use strict';

const { Router } = require('express');

const controller = require('./projects.controller');

const { createProjectRules, updateProjectRules } = require('./projects.validator');

const validate      = require('../../../middlewares/validate');
const authenticate  = require('../../../middlewares/authenticate');
const authorize     = require('../../../middlewares/authorize');

// Sub-rutas
const membersRouter = require('./members/members.routes');
const sitesRouter   = require('./sites/sites.routes');
const rolesRouter   = require('./roles/roles.routes');

const router = Router();

// Todas las rutas de proyectos requieren autenticación
router.use(authenticate);

router.get('/', controller.getAll);
router.post('/', createProjectRules, validate, controller.create);

router.get('/:projectId', authorize('project:read'), controller.getOne);
router.patch('/:projectId', authorize('project:update'), updateProjectRules, validate, controller.update);
router.delete('/:projectId', authorize('project:delete'), controller.remove);

// Delegar sub-rutas de miembros, sitios y roles usando un router intermedio
const projectSubRouter = Router({ mergeParams: true });

projectSubRouter.use('/members', membersRouter);
projectSubRouter.use('/sites',   sitesRouter);
projectSubRouter.use('/roles',   rolesRouter);

router.use('/:projectId', projectSubRouter);

module.exports = router;