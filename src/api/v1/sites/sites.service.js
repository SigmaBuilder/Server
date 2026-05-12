/* Archivo para manejar la lógica de los sites globales */

'use strict';

const db          = require('../../../config/db');
const AppError    = require('../../../utils/AppError');
const HTTP_STATUS = require('../../../constants/httpStatus');

/**
 * Obtiene un site por su slug, validando que el usuario pertenezca al proyecto del site.
 * @deprecated Use getSiteBySlug instead.
 * @param {string} slug - Slug del site.
 * @param {string} userId - ID del usuario.
 * @param {boolean} includeProject - Si es true, incluye la información del proyecto.
 * @returns {Promise<object>} - Datos del site y opcionalmente del proyecto.
 */
const getSiteBySlugGlobal = async (slug, userId, includeProject = false) => {
  // 1. Obtener el site por slug
  const site = await db('sites').where({ slug }).first();
  
  if (!site) {
    throw new AppError('Site not found', HTTP_STATUS.NOT_FOUND);
  }

  // 2. Verificar que el usuario pertenece al proyecto del site
  const member = await db('project_members')
    .where({ project_id: site.project_id, user_id: userId })
    .first();

  if (!member) {
    throw new AppError('You do not have access to this site', HTTP_STATUS.FORBIDDEN);
  }

  // 3. Si se solicita incluir el proyecto, buscarlo
  let project = null;
  if (includeProject) {
    project = await db('projects').where({ id: site.project_id }).first();
    // Podemos omitir api_key por seguridad si no es necesaria en el frontend
    if (project) {
      delete project.api_key;
    }
  }

  return { site, project };
};

/**
 * Obtiene un site específico por su ID y el ID del proyecto al que pertenece.
 * @param {string} projectId - ID del proyecto.
 * @param {string} siteId - ID del site.
 * @returns {Promise<object>} - Site.
 */
const getSiteById = async (projectId, siteId) => {
  const site = await db('sites')
    .where({ id: siteId, project_id: projectId})
    .first();
  
  if (!site) throw new AppError('Site not found', HTTP_STATUS.NOT_FOUND);
  
  return site;
};

/**
 * Obtiene un site específico por su slug y el ID del proyecto al que pertenece.
 * @param {string} projectId - ID del proyecto.
 * @param {string} slug - Slug del site.
 * @returns {Promise<object>} - Site.
 */
const getSiteBySlug = async (projectId, slug) => {
  const site = await db('sites')
    .where({ slug, project_id: projectId})
    .first();
  
  if (!site) throw new AppError('Site not found', HTTP_STATUS.NOT_FOUND);
  
  return site;
};

/**
 * Actualiza un site existente.
 * @param {string} projectId - ID del proyecto.
 * @param {string} siteId - ID del site.
 * @param {object} updateData - Datos del site a actualizar.
 * @returns {Promise<object>} - Site actualizado.
 */
const updateSite = async (projectId, siteId, updateData) => {
  try {
    const [updatedSite] = await db('sites')
      .where({ id: siteId, project_id: projectId })
      .update({
        ...updateData,
        updated_at: new Date(),
      })
      .returning(['id', 'slug', 'name', 'template_type', 'status', 'features', 'content', 'created_at', 'updated_at']);
    
    if (!updatedSite) throw new AppError('Could not update site', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    
    return updatedSite;

  } catch (err) {
    if (err.code === '23505') {
      throw new AppError(`Site with slug "${updateData.slug}" already exists`, HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
};

/**
 * Elimina un site existente.
 * @param {string} projectId - ID del proyecto.
 * @param {string} siteId - ID del site.
 */
const deleteSite = async (projectId, siteId) => {
  const deletedCount = await db('sites')
    .where({ id: siteId, project_id: projectId })
    .delete();

  if (deletedCount === 0) throw new AppError('Site not found', HTTP_STATUS.NOT_FOUND);
};

/**
 * Cambia el estado de un site a public.
 * @param {string} projectId - ID del proyecto.
 * @param {string} siteId - ID del site.
 * @returns {Promise<object>} - Site actualizado.
 */
const publishSite = async (projectId, siteId) => {
  const [updatedSite] = await db('sites')
    .where({ id: siteId, project_id: projectId })
    .update({
      status: 'public',
      updated_at: new Date(),
    })
    .returning(['id', 'slug', 'name', 'template_type', 'status', 'created_at', 'updated_at']);

  if (!updatedSite) throw new AppError('Site not found', HTTP_STATUS.NOT_FOUND);

  return updatedSite;
};

/**
 * Cambia el estado de un site a draft.
 * @param {string} projectId - ID del proyecto.
 * @param {string} siteId - ID del site.
 * @returns {Promise<object>} - Site actualizado.
 */
const unpublishSite = async (projectId, siteId) => {
  const [updatedSite] = await db('sites')
    .where({ id: siteId, project_id: projectId })
    .update({
      status: 'draft',
      updated_at: new Date(),
    })
    .returning(['id', 'slug', 'name', 'template_type', 'status', 'created_at', 'updated_at']);

  if (!updatedSite) throw new AppError('Site not found', HTTP_STATUS.NOT_FOUND);

  return updatedSite;
};

module.exports = {
  getSiteBySlugGlobal,
  getSiteById,
  getSiteBySlug,
  updateSite,
  publishSite,
  unpublishSite,
  deleteSite,
};