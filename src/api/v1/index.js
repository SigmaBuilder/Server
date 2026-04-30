/* Router principal de la API (v1). */

"use strict";

const { Router } = require("express");

const authRouter = require("./auth/auth.routes");
const projectsRouter = require('./projects/projects.routes');
const rolesRouter = require("./roles/roles.routes");

const router = Router();

router.use("/auth", authRouter);
router.use('/projects', projectsRouter);
router.use("/roles", rolesRouter);

module.exports = router;
