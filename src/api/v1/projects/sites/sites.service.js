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
    .select('id', 'slug', 'name', 'template_type', 'status', 'created_at', 'updated_at')
    .orderBy('created_at', 'desc');

  if (!sites) throw new AppError('Could not fetch sites', HTTP_STATUS.INTERNAL_SERVER_ERROR);

  return sites;
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
        status: 'draft',
        features: { modules: {} },
      })
      .returning(['id', 'slug', 'name', 'template_type', 'status', 'features', 'created_at', 'updated_at']);
    
    return newSite;

  } catch (err) {
    if (err.code === '23505' && err.constraint === 'sites_slug_key') {
      throw new AppError(`Site with slug "${siteData.slug}" already exists`, HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
};


module.exports = {
  getAllSitesByProjectId,
  createSite,
};
