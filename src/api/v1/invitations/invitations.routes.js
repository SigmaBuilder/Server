/* Rutas globales para invitaciones. */

'use strict';

const { Router } = require('express');
const controller = require('./invitations.controller');
const authenticate = require('../../../middlewares/authenticate');

const router = Router();

// Protegida: Obtener info de la invitación para mostrar "X te invitó a Y" (ahora protegida en el front)
router.get('/:token', authenticate, controller.getInvitationInfo);

// Protegida: Aceptar la invitación (el usuario debe haber iniciado sesión/registrado)
router.post('/:token/accept', authenticate, controller.acceptInvitation);

module.exports = router;
