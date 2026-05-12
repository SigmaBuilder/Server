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

module.exports = {
  getAllSitesByProject,
  createSite,
};