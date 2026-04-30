/* Archivo para manejar la lógica de los proyectos. */

'use strict';

const db          = require('../../../config/db');
const AppError    = require('../../../utils/AppError');
const HTTP_STATUS = require('../../../constants/httpStatus');

/**
 * Retorna todos los proyectos en los que el usuario es miembro.
 * @param {string} userId - ID del usuario.
 */
const getProjectsForUser = async (userId) => {
  const rows = await db('project_members as pm')
    .join('projects as p', 'p.id', 'pm.project_id')
    .leftJoin('roles as r', 'r.id', 'pm.role_id')
    .where('pm.user_id', userId)
    .select(
      'pm.created_at as joined_at',
      'r.id as role_id',
      'r.name as role_name',
      'p.id as project_id',
      'p.name as project_name',
      'p.description as project_description',
      'p.created_at as project_created_at',
    );

  if (!rows) throw new AppError('Could not fetch projects', HTTP_STATUS.INTERNAL_SERVER_ERROR);

  return rows.map((row) => ({
    joined_at: row.joined_at,
    role:      row.role_id ? { id: row.role_id, name: row.role_name } : null,
    project:   {
      id:          row.project_id,
      name:        row.project_name,
      description: row.project_description,
      created_at:  row.project_created_at,
    },
  }));
};

/**
 * Retorna un proyecto por ID.
 * @param {string} projectId - ID del proyecto.
 */
const getProjectById = async (projectId) => {
  const project = await db('projects')
    .where({ id: projectId })
    .select('id', 'name', 'description', 'created_at')
    .first();

  if (!project) throw new AppError('Project not found', HTTP_STATUS.NOT_FOUND);
  return project;
};

/**
 * Crea un proyecto y asigna automáticamente al creador como dueño.
 * El rol "owner" debe existir en la tabla de roles.
 * @param {{ name: string, description?: string }} dto - Datos del proyecto.
 * @param {string} creatorUserId - ID del usuario creador.
 */
const createProject = async ({ name, description }, creatorUserId) => {
  const ownerRole = await db('roles').where({ name: 'owner' }).select('id').first();

  if (!ownerRole) {
    throw new AppError('Owner role not seeded. Please run database init.sql.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  }

  const project = await db.transaction(async (trx) => {
    const [newProject] = await trx('projects')
      .insert({ name, description: description ?? null })
      .returning(['id', 'name', 'description', 'api_key', 'created_at']);

    await trx('project_members').insert({
      project_id: newProject.id,
      user_id:    creatorUserId,
      role_id:    ownerRole.id,
    });

    return newProject;
  });

  return project;
};

/**
 * Actualiza los metadatos de un proyecto.
 * @param {string} projectId - ID del proyecto.
 * @param {{ name?: string, description?: string }} dto - Datos del proyecto.
 */
const updateProject = async (projectId, dto) => {
  const [updated] = await db('projects')
    .where({ id: projectId })
    .update(dto)
    .returning(['id', 'name', 'description', 'created_at']);

  if (!updated) throw new AppError('Could not update project', HTTP_STATUS.INTERNAL_SERVER_ERROR);
  return updated;
};

/**
 * Elimina un proyecto.
 * @param {string} projectId
 */
const deleteProject = async (projectId) => {
  const deleted = await db('projects').where({ id: projectId }).delete();
  if (!deleted) throw new AppError('Could not delete project', HTTP_STATUS.INTERNAL_SERVER_ERROR);
};

module.exports = { 
  getProjectsForUser, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject 
};