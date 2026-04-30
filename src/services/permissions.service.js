/* Archivo que maneja los permisos del usuario. */

'use strict';

const db           = require('../config/db');
const AppError     = require('../utils/AppError');
const HTTP_STATUS  = require('../constants/httpStatus');

/**
 * Devuelve todas las acciones de permiso de un usuario dentro de un proyecto específico.
 *
 * Llama a la función de PostgreSQL get_user_permissions() que realiza:
 *   project_members → role_permissions → permissions (solo ida)
 *
 * @param {string} userId
 * @param {string} projectId
 * @returns {Promise<string[]>} Array de strings de acciones de permiso
 */
const getUserPermissions = async (userId, projectId) => {
  const result = await db.raw( 
    'SELECT action FROM get_user_permissions(?, ?)',
    [userId, projectId],
  );

  if (!result) throw new AppError('Could not resolve permissions', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  return (result.rows ?? []).map((row) => row.action);
};

/**
 * Devuelve el rol de un usuario dentro de un proyecto.
 * @param {string} userId
 * @param {string} projectId
 * @returns {Promise<{ id: string, name: string, description: string } | null>}
 */
const getUserRole = async (userId, projectId) => {
  const row = await db('project_members as proj_mem')
    .join('roles as rol', 'rol.id', 'proj_mem.role_id')
    .where({ 'proj_mem.user_id': userId, 'proj_mem.project_id': projectId })
    .select('rol.id', 'rol.name', 'rol.description')
    .first();

  return row ?? null;
};

/**
 * Comprueba si un usuario tiene un permiso específico dentro de un proyecto.
 * @param {string} userId
 * @param {string} projectId
 * @param {string} action
 * @returns {Promise<boolean>}
 */
const userHasPermission = async (userId, projectId, action) => {
  const permissions = await getUserPermissions(userId, projectId);
  return permissions.includes(action);
};

/**
 * Comprueba si un usuario tiene TODOS los permisos dados.
 * @param {string} userId
 * @param {string} projectId
 * @param {string[]} actions
 * @returns {Promise<boolean>}
 */
const userHasAllPermissions = async (userId, projectId, actions) => {
  const permissions = await getUserPermissions(userId, projectId);
  return actions.every((action) => permissions.includes(action));
};

/**
 * Comprueba si un usuario tiene AL MENOS UNO de los permisos dados.
 * @param {string} userId
 * @param {string} projectId
 * @param {string[]} actions
 * @returns {Promise<boolean>}
 */
const userHasAnyPermission = async (userId, projectId, actions) => {
  const permissions = await getUserPermissions(userId, projectId);
  return actions.some((action) => permissions.includes(action));
};

module.exports = {
  getUserPermissions,
  getUserRole,
  userHasPermission,
  userHasAllPermissions,
  userHasAnyPermission,
};