/* Rutas para la API pública. */

'use strict';

const { Router } = require('express');

const controller = require('./public.controller');
const resolvePublicSiteContext = require('../../../middlewares/resolvePublicSiteContext');
const checkModuleActive = require('../../../middlewares/checkModuleActive');

// Sub-routers de los módulos
const portfolioRoutes = require('./modules/portfolio/portfolio.routes');
const blogRoutes = require('./modules/blog/blog.routes');

const router = Router();

// 1. Preferencias del sitio e información general
router.get('/sites/:slug', resolvePublicSiteContext, controller.getPublicSiteInfo);

// 2. Módulos del sitio (rutas anidadas y con middleware de activación específico)
router.use(
  '/sites/:slug/modules/portfolio', 
  resolvePublicSiteContext, 
  checkModuleActive('portfolio'), 
  portfolioRoutes
);

router.use(
  '/sites/:slug/modules/blog', 
  resolvePublicSiteContext, 
  checkModuleActive('blog'), 
  blogRoutes
);

module.exports = router;
