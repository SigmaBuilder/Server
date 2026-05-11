/* Router para endpoints globales de sites. */

'use strict';

const { Router } = require('express');
const controller = require('./sites.controller');
const authenticate = require('../../../middlewares/authenticate');

const router = Router();

// Todas las rutas de sites globales requieren autenticación
router.use(authenticate);

// Obtener sitio por slug globalmente
router.get('/slug/:slug', controller.getSiteBySlugGlobal);

module.exports = router;
