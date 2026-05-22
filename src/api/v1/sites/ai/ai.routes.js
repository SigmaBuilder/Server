'use strict';

const { Router } = require('express');
const controller = require('./ai.controller');
const authorize = require('../../../../middlewares/authorize');

const router = Router({ mergeParams: true });

// El middleware resolveSiteContext ya se ha ejecutado en sites.routes.js
// Asumimos que los endpoints de IA requieren permiso de lectura del proyecto/sitio
router.post('/chat', authorize("project:read"), controller.chat);

module.exports = router;
