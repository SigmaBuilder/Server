/* Controladores de rutas de members. */

'use strict';

const membersService = require('./members.service');
const { sendSuccess } = require('../../../../utils/response');
const HTTP_STATUS = require('../../../../constants/httpStatus');

/**
 * Obtiene todos los miembros de un proyecto.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getAll = async (req, res, next) => {
  try {
    const members = await membersService.getMembersOfProject(req.params.projectId);
    sendSuccess(res, { members });
  } catch (err) { next(err); }
};

/**
 * Añade un nuevo miembro a un proyecto.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const add = async (req, res, next) => {
  try {
    const member = await membersService.addMember(
      req.params.projectId,
      req.body.userId,
      req.body.roleId,
    );
    sendSuccess(res, { member }, HTTP_STATUS.CREATED);
  } catch (err) { next(err); }
};

/**
 * Actualiza el rol de un miembro de un proyecto.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const update = async (req, res, next) => {
  try {
    const member = await membersService.updateMemberRole(
      req.params.projectId,
      req.params.userId,
      req.body.roleId,
    );
    sendSuccess(res, { member });
  } catch (err) { next(err); }
};

/**
 * Elimina un miembro de un proyecto.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const remove = async (req, res, next) => {
  try {
    await membersService.removeMember(req.params.projectId, req.params.userId);
    sendSuccess(res, null, HTTP_STATUS.NO_CONTENT);
  } catch (err) { next(err); }
};

module.exports = {
  getAll,
  add,
  update,
  remove
};
