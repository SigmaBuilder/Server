/* Controladores de rutas de invitaciones. */

'use strict';

const invitationsService = require('./invitations.service');
const { sendSuccess } = require('../../../utils/response');

/**
 * Obtiene la información de una invitación.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getInvitationInfo = async (req, res, next) => {
  try {
    const info = await invitationsService.getInvitationInfo(req.params.token);
    sendSuccess(res, { invitation: info });
  } catch (err) { next(err); }
};

/**
 * Acepta una invitación.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const acceptInvitation = async (req, res, next) => {
  try {
    const result = await invitationsService.acceptInvitation(req.params.token, req.user);
    sendSuccess(res, result);
  } catch (err) { next(err); }
};

module.exports = {
  getInvitationInfo,
  acceptInvitation,
};
