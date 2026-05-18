/* Rutas para la API pública. */

'use strict';

const { Router } = require('express');

const controller = require('./public.controller');

const resolvePublicSiteContext = require('../../../middlewares/resolvePublicSiteContext');
const checkModuleActive = require('../../../middlewares/checkModuleActive');

const router = Router();

router.get('/sites/:slug', resolvePublicSiteContext, controller.getPublicSiteInfo);

router.get('/sites/:slug/portfolio', resolvePublicSiteContext, checkModuleActive('portfolio'), controller.getPublicPortfolio);

router.get('/sites/:slug/blog/categories', resolvePublicSiteContext, checkModuleActive('blog'), controller.getPublicBlogCategories);
router.get('/sites/:slug/blog/posts', resolvePublicSiteContext, checkModuleActive('blog'), controller.getPublicBlogPosts);
router.get('/sites/:slug/blog/posts/:postSlug', resolvePublicSiteContext, checkModuleActive('blog'), controller.getPublicBlogPostBySlug);

module.exports = router;
