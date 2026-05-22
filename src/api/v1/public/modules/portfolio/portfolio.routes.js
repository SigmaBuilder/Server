'use strict';

const { Router } = require('express');
const controller = require('./portfolio.controller');

const router = Router();

router.get('/items', controller.getPublicPortfolio); // Mantenemos el /items que tenías para retrocompatibilidad 

module.exports = router;
