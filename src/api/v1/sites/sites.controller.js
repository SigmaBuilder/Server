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
    const site = await sitesService.getSiteById(
      req.params.projectId,
      req.params.siteId,
    );
    sendSuccess(res, { site });
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
    const site = await sitesService.getSiteBySlug(
      req.params.projectId,
      req.params.slug,
    );
    sendSuccess(res, { site });
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
      req.params.projectId,
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
    await sitesService.deleteSite(req.params.projectId, req.params.siteId);
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
      req.params.projectId,
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
      req.params.projectId,
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