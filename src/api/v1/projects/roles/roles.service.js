/* Archivo para manejar la lógica de los roles. */

'use strict';

const db          = require('../../../../config/db');
const AppError    = require('../../../../utils/AppError');
const HTTP_STATUS = require('../../../../constants/httpStatus');

/**
 * Retorna todos los roles con sus permisos asociados.
 */
const getAllRoles = async () => {
  const roles = await db('roles as r')
    .leftJoin('role_permissions as rp', 'rp.role_id', 'r.id')
    .leftJoin('permissions as p', 'p.id', 'rp.permission_id')
    .select('r.id', 'r.name', 'r.description', 'r.super', 'p.id as perm_id', 'p.action as perm_action')
    .orderBy('r.name');

  if (!roles) throw new AppError('Could not fetch roles', HTTP_STATUS.INTERNAL_SERVER_ERROR);

  // Agrupa los permisos por rol
  return groupRolesWithPermissions(roles);
};

/**
 * Retorna un rol por ID con sus permisos asociados.
 * @param {string} roleId - ID del rol.
 */
const getRoleById = async (roleId) => {
  const rows = await db('roles as r')
    .leftJoin('role_permissions as rp', 'rp.role_id', 'r.id')
    .leftJoin('permissions as p', 'p.id', 'rp.permission_id')
    .where('r.id', roleId)
    .select('r.id', 'r.name', 'r.description', 'r.super', 'p.id as perm_id', 'p.action as perm_action');

  if (!rows || rows.length === 0) throw new AppError('Role not found', HTTP_STATUS.NOT_FOUND);

  return groupRolesWithPermissions(rows)[0];
};

/**
 * Crea un nuevo rol, opcionalmente sembrando sus permisos iniciales.
 * @param {{ name: string, description?: string, permissionIds?: string[] }} dto - Datos del rol.
 */
const createRole = async ({ name, description, permissionIds = [] }) => {
  try {
    const [role] = await db('roles')
      .insert({ name, description: description ?? null })
      .returning(['id', 'name', 'description', 'super']);

    if (permissionIds.length > 0) {
      await setRolePermissions(role.id, permissionIds);
    }

    return getRoleById(role.id);
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError(`Role "${name}" already exists`, HTTP_STATUS.CONFLICT);
    }
    throw new AppError('Could not create role', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Actualiza el nombre y/o la descripción de un rol.
 * @param {string} roleId - ID del rol.
 * @param {{ name?: string, description?: string }} dto - Datos del rol.
 */
const updateRole = async (roleId, dto, userPermissions = []) => {
  const role = await db('roles').where({ id: roleId }).first();
  if (!role) throw new AppError('Role not found', HTTP_STATUS.NOT_FOUND);
  if (role.super && !userPermissions.includes('project:delete')) {
    throw new AppError('Requires additional permission (project:delete) to update a super role', HTTP_STATUS.FORBIDDEN);
  }

  const [updated] = await db('roles')
    .where({ id: roleId })
    .update(dto)
    .returning(['id', 'name', 'description', 'super']);

  if (!updated) throw new AppError('Could not update role', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  return updated;
};

/**
 * Elimina un rol. Falla si algún miembro del proyecto lo está usando.
 * @param {string} roleId - ID del rol.
 */
const deleteRole = async (roleId, userPermissions = []) => {
  const role = await db('roles').where({ id: roleId }).first();
  if (!role) throw new AppError('Role not found', HTTP_STATUS.NOT_FOUND);
  if (role.super && !userPermissions.includes('project:delete')) {
    throw new AppError('Requires additional permission (project:delete) to delete a super role', HTTP_STATUS.FORBIDDEN);
  }

  const result = await db('project_members').where({ role_id: roleId }).count('* as count').first();
  const count  = parseInt(result?.count ?? '0', 10);

  if (count > 0) {
    throw new AppError(
      'Cannot delete a role that is currently assigned to project members',
      HTTP_STATUS.CONFLICT,
    );
  }

  await db('roles').where({ id: roleId }).delete();
};

/**
 * Reemplaza el conjunto completo de permisos para un rol (estrategia de eliminación + inserción).
 * @param {string} roleId - ID del rol.
 * @param {string[]} permissionIds - IDs de los permisos.
 */
const setRolePermissions = async (roleId, permissionIds, userPermissions = []) => {
  const role = await db('roles').where({ id: roleId }).first();
  if (!role) throw new AppError('Role not found', HTTP_STATUS.NOT_FOUND);
  if (role.super && !userPermissions.includes('project:delete')) {
    throw new AppError('Requires additional permission (project:delete) to modify permissions of a super role', HTTP_STATUS.FORBIDDEN);
  }

  await db('role_permissions').where({ role_id: roleId }).delete();

  if (permissionIds.length === 0) return;

  const rows = permissionIds.map((permissionId) => ({ role_id: roleId, permission_id: permissionId }));
  await db('role_permissions').insert(rows);
};

/**
 * Retorna todos los permisos disponibles.
 */
const getAllPermissions = async () => {
  const perms = await db('permissions').select('id', 'action').orderBy('action');
  if (!perms) throw new AppError('Could not fetch permissions', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  return perms;
};

/**
 * Agrupa los permisos por rol.
 * @param {object[]} rows - Filas de la tabla de roles con permisos.
 * @returns {object[]} - Roles con permisos agrupados.
 */
const groupRolesWithPermissions = (rows) => {
  const map = new Map();

  for (const row of rows) {
    if (!map.has(row.id)) {
      map.set(row.id, { id: row.id, name: row.name, description: row.description, super: row.super, permissions: [] });
    }
    if (row.perm_id) {
      map.get(row.id).permissions.push({ id: row.perm_id, action: row.perm_action });
    }
  }

  return [...map.values()];
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  setRolePermissions,
  getAllPermissions,
};