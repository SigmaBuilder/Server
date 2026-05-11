/* Archivo para manejar la lógica de los sites globales */

'use strict';

const db          = require('../../../config/db');
const AppError    = require('../../../utils/AppError');
const HTTP_STATUS = require('../../../constants/httpStatus');

/**
 * Obtiene un site por su slug, validando que el usuario pertenezca al proyecto del site.
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

module.exports = {
  getSiteBySlugGlobal,
};
