/* Controladores de rutas globales de sites. */

'use strict';

const sitesService = require('./sites.service');
const { sendSuccess } = require('../../../utils/response');
const HTTP_STATUS = require('../../../constants/httpStatus');

/**
 * Obtiene un site por su ID.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getSiteById = async (req, res, next) => {
  try {
    const includeProject = req.query.includeProject === 'true';
    const result = await sitesService.getSiteById(
      req.projectId,
      req.params.siteId,
      includeProject
    );
    // result contiene { site, project } (project será undefined si includeProject es false)
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * Obtiene un site por su slug.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getSiteBySlug = async (req, res, next) => {
  try {
    const includeProject = req.query.includeProject === 'true';
    const result = await sitesService.getSiteBySlug(
      req.projectId,
      req.params.slug,
      includeProject
    );
    // result contiene { site, project }
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

/**
 * Actualiza un site.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const updateSite = async (req, res, next) => {
  try {
    const site = await sitesService.updateSite(
      req.projectId,
      req.params.siteId,
      req.body,
    );
    sendSuccess(res, { site });
  } catch (err) {
    next(err);
  }
};

/**
 * Elimina un site.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const deleteSite = async (req, res, next) => {
  try {
    await sitesService.deleteSite(req.projectId, req.params.siteId);
    sendSuccess(res, null, HTTP_STATUS.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};

/**
 * Publica un site (status = 'public').
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const publishSite = async (req, res, next) => {
  try {
    const site = await sitesService.publishSite(
      req.projectId,
      req.params.siteId,
    );
    sendSuccess(res, { site });
  } catch (err) {
    next(err);
  }
};

/**
 * Pone un site en borrador (status = 'draft').
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const unpublishSite = async (req, res, next) => {
  try {
    const site = await sitesService.unpublishSite(
      req.projectId,
      req.params.siteId,
    );
    sendSuccess(res, { site });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSiteById,
  getSiteBySlug,
  updateSite,
  publishSite,
  unpublishSite,
  deleteSite,
};