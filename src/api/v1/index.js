/* Router principal de la API (v1). */

"use strict";

const { Router } = require("express");

const authRouter = require("./auth/auth.routes");
const projectsRouter = require('./projects/projects.routes');
const sitesRouter = require('./sites/sites.routes');

const router = Router();

router.use("/auth", authRouter);
router.use('/projects', projectsRouter);
router.use('/sites', sitesRouter);

module.exports = router;
