/* Controladores de portfolio_items */

'use strict';

const service = require('./portfolio_items.service');
const { sendSuccess } = require('../../../../../utils/response');
const HTTP_STATUS = require('../../../../../constants/httpStatus');

/**
 * Obtiene todos los elementos del portfolio ordenados por 'sort_order'
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll(req.params.siteId);
    sendSuccess(res, { portfolioItems: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Obtiene un elemento del portfolio por ID.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.siteId, req.params.id);
    sendSuccess(res, { portfolioItem: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Crea un nuevo elemento del portfolio.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const create = async (req, res, next) => {
  try {
    const data = await service.create(req.params.siteId, req.body);
    sendSuccess(res, { portfolioItem: data }, HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

/**
 * Actualiza un elemento del portfolio.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.siteId, req.params.id, req.body);
    sendSuccess(res, { portfolioItem: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Elimina un elemento del portfolio.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.siteId, req.params.id);
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
