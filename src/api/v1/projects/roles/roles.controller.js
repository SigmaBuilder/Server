/* Controladores de rutas de roles. */

'use strict';

const rolesService = require('./roles.service');
const permissionsService = require('../../../../services/permissions.service');
const { sendSuccess } = require('../../../../utils/response');
const HTTP_STATUS = require('../../../../constants/httpStatus');

/**
 * Obtiene todos los roles.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getAll = async (req, res, next) => {
  try {
    const roles = await rolesService.getAllRoles();
    sendSuccess(res, { roles });
  } catch (err) { next(err); }
};

/**
 * Obtiene un rol por su ID.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getOne = async (req, res, next) => {
  try {
    const role = await rolesService.getRoleById(req.params.roleId);
    sendSuccess(res, { role });
  } catch (err) { next(err); }
};

/**
 * Crea un nuevo rol.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const create = async (req, res, next) => {
  try {
    const role = await rolesService.createRole(req.body);
    sendSuccess(res, { role }, HTTP_STATUS.CREATED);
  } catch (err) { next(err); }
};

/**
 * Actualiza un rol.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const update = async (req, res, next) => {
  try {
    const userPermissions = await permissionsService.getUserPermissions(req.user.id, req.params.projectId);
    const role = await rolesService.updateRole(req.params.roleId, req.body, userPermissions);
    sendSuccess(res, { role });
  } catch (err) { next(err); }
};

/**
 * Elimina un rol.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const remove = async (req, res, next) => {
  try {
    const userPermissions = await permissionsService.getUserPermissions(req.user.id, req.params.projectId);
    await rolesService.deleteRole(req.params.roleId, userPermissions);
    sendSuccess(res, null, HTTP_STATUS.NO_CONTENT);
  } catch (err) { next(err); }
};

/**
 * Obtiene los permisos de un rol.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getPermissions = async (req, res, next) => {
  try {
    const role = await rolesService.getRoleById(req.params.roleId);
    sendSuccess(res, { permissions: role.role_permissions });
  } catch (err) { next(err); }
};

/**
 * Asigna permisos a un rol.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const setPermissions = async (req, res, next) => {
  try {
    const userPermissions = await permissionsService.getUserPermissions(req.user.id, req.params.projectId);
    await rolesService.setRolePermissions(req.params.roleId, req.body.permissionIds, userPermissions);
    const role = await rolesService.getRoleById(req.params.roleId);
    sendSuccess(res, { role });
  } catch (err) { next(err); }
};

/**
 * Obtiene todos los permisos de la aplicación.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getAllPermissions = async (req, res, next) => {
  try {
    const permissions = await rolesService.getAllPermissions();
    sendSuccess(res, { permissions });
  } catch (err) { next(err); }
};

module.exports = {
  getAll,
  getOne,
  create,
  update,
  remove,
  getPermissions,
  setPermissions,
  getAllPermissions
};