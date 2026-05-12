/* Router para endpoints globales de sites. */

'use strict';

const { Router } = require('express');
const controller = require('./sites.controller');
const authenticate = require('../../../middlewares/authenticate');
const authorize = require('../../../middlewares/authorize');
const validate = require('../../../middlewares/validate');
const { updateSiteRules } = require('./sites.validator');

const router = Router();

// Todas las rutas de sites globales requieren autenticación
router.use(authenticate);

// Middlewares
const resolveSiteContext = require('../../../middlewares/resolveSiteContext');

// Sub-routers
const portfolioItemsRouter = require('./modules/portfolio/items/items.routes');

// Obtener sitio por slug globalmente usando el context resolver
router.get('/slug/:slug', resolveSiteContext, authorize("project:read"), controller.getSiteBySlug);

// Rutas de Site por ID
router.get('/:siteId', resolveSiteContext, authorize("project:read"), controller.getSiteById);

router.patch(
  '/:siteId',
  resolveSiteContext,
  authorize("project:update"),
  updateSiteRules,
  validate,
  controller.updateSite
);

router.delete('/:siteId', resolveSiteContext, authorize("project:update"), controller.deleteSite);


// Sub-rutas de módulos (Requieren projectId para autorización, por lo que usan resolveSiteContext)
router.use('/:siteId/modules/portfolio/items', resolveSiteContext, portfolioItemsRouter);

module.exports = router;