/* Archivo para manejar la lógica de los sites */

'use strict';

const db          = require('../../../../config/db');
const AppError    = require('../../../../utils/AppError');
const HTTP_STATUS = require('../../../../constants/httpStatus');

/**
 * Retorna todos los sites con sus permisos asociados.
 * @param {string} projectId - ID del proyecto.
 */
const getAllSitesByProjectId = async (projectId) => {
  const sites = await db('sites')
    .where({ project_id: projectId })
    .select('id', 'slug', 'name', 'template_type', 'created_at', 'updated_at')
    .orderBy('created_at', 'desc');

  if (!sites) throw new AppError('Could not fetch sites', HTTP_STATUS.INTERNAL_SERVER_ERROR);

  return sites;
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
 * Crea un nuevo site.
 * @param {string} projectId - ID del proyecto.
 * @param {object} siteData - Datos del site.
 * @returns {Promise<object>} - Site creado.
 */
const createSite = async (projectId, siteData) => {
  try {
    const [newSite] = await db('sites')
      .insert({
        project_id: projectId,
        slug: siteData.slug,
        name: siteData.name,
        template_type: siteData.templateType,
      })
      .returning(['id', 'slug', 'name', 'template_type', 'created_at']);
    
    return newSite;

  } catch (err) {
    if (err.code === '23505' && err.constraint === 'sites_slug_key') {
      throw new AppError(`Site with slug "${siteData.slug}" already exists`, HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
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
      .returning(['id', 'slug', 'name', 'template_type', 'features', 'content', 'created_at', 'updated_at']);
    
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

module.exports = {
  getAllSitesByProjectId,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
};