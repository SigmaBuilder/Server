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
const portfolioStackRouter = require('./modules/portfolio/stack/stack.routes');
const blogCategoriesRouter = require('./modules/blog/categories/categories.routes');
const blogPostsRouter = require('./modules/blog/posts/posts.routes');

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

router.post('/:siteId/publish', resolveSiteContext, authorize("project:update"), controller.publishSite);
router.post('/:siteId/draft', resolveSiteContext, authorize("project:update"), controller.unpublishSite);

router.delete('/:siteId', resolveSiteContext, authorize("project:update"), controller.deleteSite);


// Sub-rutas de módulos (Requieren projectId para autorización, por lo que usan resolveSiteContext)
router.use('/:siteId/modules/portfolio/items', resolveSiteContext, portfolioItemsRouter);
router.use('/:siteId/modules/portfolio/stack', resolveSiteContext, portfolioStackRouter);
router.use('/:siteId/modules/blog/categories', resolveSiteContext, blogCategoriesRouter);
router.use('/:siteId/modules/blog/posts', resolveSiteContext, blogPostsRouter);

module.exports = router;