/* Rutas de sites. */

"use strict";

const { Router } = require("express");

const controller = require("./sites.controller");

const { createSiteRules } = require("./sites.validator");

const validate = require("../../../../middlewares/validate");
const authorize = require("../../../../middlewares/authorize");

const router = Router({ mergeParams: true });

router.get("/", authorize("project:read"), controller.getAllSitesByProject);
router.post(
  "/",
  authorize("project:update"),
  createSiteRules,
  validate,
  controller.createSite,
);

module.exports = router;