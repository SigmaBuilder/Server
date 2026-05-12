/* Rutas de sites. */

"use strict";

const { Router } = require("express");

const controller = require("./sites.controller");

const { createSiteRules, updateSiteRules } = require("./sites.validator");

const validate = require("../../../../middlewares/validate");
const authorize = require("../../../../middlewares/authorize");

// Sub-rutas
const portfolioItemsRouter = require('./portfolio_items/portfolio_items.routes');

const router = Router({ mergeParams: true });

router.get("/", authorize("project:read"), controller.getAllSitesByProject);
router.get("/slug/:slug", authorize("project:read"), controller.getSiteBySlug);
router.get("/:siteId", authorize("project:read"), controller.getSiteById);

router.post("/", authorize("project:update"), createSiteRules, validate, controller.createSite);

router.patch("/:siteId", authorize("project:update"), updateSiteRules, validate, controller.updateSite);

router.delete("/:siteId", authorize("project:update"), controller.deleteSite);

// Delegar sub-rutas de portfolio_items
router.use('/:siteId/portfolio-items', portfolioItemsRouter);

module.exports = router;
