/* Lógica de negocio para los miembros del proyecto. */

'use strict';

const db          = require('../../../../config/db');
const AppError    = require('../../../../utils/AppError');
const HTTP_STATUS = require('../../../../constants/httpStatus');

/**
 * Retorna todos los miembros de un proyecto, incluyendo su perfil y rol.
 * @param {string} projectId - ID del proyecto.
 */
const getMembersOfProject = async (projectId) => {
  const rows = await db('project_members as pm')
    .join('users as u', 'u.id', 'pm.user_id')
    .leftJoin('roles as r', 'r.id', 'pm.role_id')
    .where('pm.project_id', projectId)
    .select(
      'pm.created_at as joined_at',
      'r.id as role_id',
      'r.name as role_name',
      'u.id as user_id',
      'u.first_name',
      'u.last_name',
      'u.avatar_url',
    );

  if (!rows) throw new AppError('Could not fetch members', HTTP_STATUS.INTERNAL_SERVER_ERROR);

  return rows.map((row) => ({
    joined_at: row.joined_at,
    role:    row.role_id ? { id: row.role_id, name: row.role_name } : null,
    profile: {
      id:         row.user_id,
      first_name: row.first_name,
      last_name:  row.last_name,
      avatar_url: row.avatar_url,
    },
  }));
};

/**
 * Añade un usuario a un proyecto con el rol especificado.
 * @param {string} projectId - ID del proyecto.
 * @param {string} userId - ID del usuario.
 * @param {string} roleId - ID del rol.
 */
const addMember = async (projectId, userId, roleId) => {
  try {
    const [member] = await db('project_members')
      .insert({ project_id: projectId, user_id: userId, role_id: roleId })
      .returning(['project_id', 'user_id', 'role_id', 'created_at']);

    return member;
  } catch (err) {
    // PostgreSQL unique violation
    if (err.code === '23505') {
      throw new AppError('User is already a member of this project', HTTP_STATUS.CONFLICT);
    }
    throw new AppError('Could not add member', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }
};

/**
 * Helper: cuenta los dueños en un proyecto.
 * @param {string} projectId - ID del proyecto.
 * @returns {Promise<number>} - Número de dueños.
 */
const countOwners = async (projectId) => {
  const result = await db('project_members as pm')
    .join('roles as r', 'r.id', 'pm.role_id')
    .where({ 'pm.project_id': projectId, 'r.name': 'owner' })
    .count('pm.user_id as count')
    .first();

  return parseInt(result?.count ?? '0', 10);
};

/**
 * Actualiza el rol de un miembro en un proyecto.
 * Evita que se elimine al último dueño de un proyecto.
 * @param {string} projectId - ID del proyecto.
 * @param {string} userId - ID del usuario.
 * @param {string} newRoleId - ID del nuevo rol.
 */
const updateMemberRole = async (projectId, userId, newRoleId) => {
  const currentMember = await db('project_members as pm')
    .join('roles as r', 'r.id', 'pm.role_id')
    .where({ 'pm.project_id': projectId, 'pm.user_id': userId })
    .select('r.name as role_name')
    .first();

  if (currentMember?.role_name === 'owner') {
    const ownerCount = await countOwners(projectId);
    if (ownerCount <= 1) {
      throw new AppError('Cannot remove the last owner from the project', HTTP_STATUS.CONFLICT);
    }
  }

  const [updated] = await db('project_members')
    .where({ project_id: projectId, user_id: userId })
    .update({ role_id: newRoleId })
    .returning(['project_id', 'user_id', 'role_id']);

  if (!updated) throw new AppError('Could not update member role', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  return updated;
};

/**
 * Elimina un miembro de un proyecto.
 * Evita que se elimine al último dueño de un proyecto.
 * @param {string} projectId - ID del proyecto.
 * @param {string} userId - ID del usuario.
 */
const removeMember = async (projectId, userId) => {
  const member = await db('project_members as pm')
    .join('roles as r', 'r.id', 'pm.role_id')
    .where({ 'pm.project_id': projectId, 'pm.user_id': userId })
    .select('r.name as role_name')
    .first();

  if (member?.role_name === 'owner') {
    const ownerCount = await countOwners(projectId);
    if (ownerCount <= 1) {
      throw new AppError('Cannot remove the last owner from the project', HTTP_STATUS.CONFLICT);
    }
  }

  const deleted = await db('project_members')
    .where({ project_id: projectId, user_id: userId })
    .delete();

  if (!deleted) throw new AppError('Could not remove member', HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

module.exports = { 
  getMembersOfProject, 
  addMember, 
  updateMemberRole, 
  removeMember 
};