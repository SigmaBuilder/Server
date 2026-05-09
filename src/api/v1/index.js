/* Router principal de la API (v1). */

"use strict";

const { Router } = require("express");

const authRouter = require("./auth/auth.routes");
const projectsRouter = require('./projects/projects.routes');

const router = Router();

router.use("/auth", authRouter);
router.use('/projects', projectsRouter);

module.exports = router;
