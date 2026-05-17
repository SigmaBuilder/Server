/* Controladores de portfolio_sections */

'use strict';

const service = require('./sections.service');
const { sendSuccess } = require('../../../../../../utils/response');
const HTTP_STATUS = require('../../../../../../constants/httpStatus');

/**
 * Obtiene todas las secciones del portfolio ordenadas por 'sort_order'
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll(req.params.siteId);
    sendSuccess(res, { portfolioSections: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Obtiene una sección del portfolio por ID.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.siteId, req.params.sectionId);
    sendSuccess(res, { portfolioSection: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Crea una nueva sección del portfolio.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const create = async (req, res, next) => {
  try {
    const data = await service.create(req.params.siteId, req.body);
    sendSuccess(res, { portfolioSection: data }, HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

/**
 * Actualiza una sección del portfolio.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.siteId, req.params.sectionId, req.body);
    sendSuccess(res, { portfolioSection: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Elimina una sección del portfolio.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.siteId, req.params.sectionId);
    sendSuccess(res, null, HTTP_STATUS.NO_CONTENT);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
