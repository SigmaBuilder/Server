/* Router para endpoints globales de sites. */

'use strict';

const { Router } = require('express');
const controller = require('./sites.controller');
const authenticate = require('../../../middlewares/authenticate');

const router = Router();

// Todas las rutas de sites globales requieren autenticación
router.use(authenticate);

// Sub-routers
const portfolioItemsRouter = require('./modules/portfolio/items/items.routes');

// Middlewares
const resolveSiteContext = require('../../../middlewares/resolveSiteContext');

// Obtener sitio por slug globalmente
router.get('/slug/:slug', controller.getSiteBySlugGlobal);

// Sub-rutas de módulos (Requieren projectId para autorización)
router.use('/:siteId/modules/portfolio/items', resolveSiteContext, portfolioItemsRouter);

module.exports = router;
