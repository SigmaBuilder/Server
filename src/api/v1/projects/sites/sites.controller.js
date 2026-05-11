/* Controladores de rutas de sites. */

"use strict";

const sitesService = require("./sites.service");
const { sendSuccess } = require("../../../../utils/response");
const HTTP_STATUS = require("../../../../constants/httpStatus");

/**
 * Obtiene todos los sites de un proyecto.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getAllSitesByProject = async (req, res, next) => {
  try {
    const sites = await sitesService.getAllSitesByProjectId(
      req.params.projectId,
    );
    sendSuccess(res, { sites });
  } catch (err) {
    next(err);
  }
};

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
 * Crea un nuevo site.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const createSite = async (req, res, next) => {
  try {
    const site = await sitesService.createSite(req.params.projectId, req.body);
    sendSuccess(res, { site }, HTTP_STATUS.CREATED);
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

module.exports = {
  getAllSitesByProject,
  getSiteById,
  createSite,
  updateSite,
  deleteSite,
  getSiteBySlug,
};
