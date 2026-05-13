/* Controladores de portfolio_stack */

'use strict'

const service = require('./stack.service');
const { sendSuccess } = require('../../../../../../utils/response');
const HTTP_STATUS = require('../../../../../../constants/httpStatus');

/**
 * Obtiene todos los elementos del stack del portfolio ordenados por 'sort_order'
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll(req.params.siteId);
    sendSuccess(res, { portfolioStack: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Obtiene un elemento del stack del portfolio por ID.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.siteId, req.params.stackId);
    sendSuccess(res, { portfolioStack: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Crea un nuevo elemento del stack del portfolio.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const create = async (req, res, next) => {
  try {
    const data = await service.create(req.params.siteId, req.body);
    sendSuccess(res, { portfolioStack: data }, HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

/**
 * Actualiza un elemento del stack del portfolio.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.siteId, req.params.stackId, req.body);
    sendSuccess(res, { portfolioStack: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Elimina un elemento del stack del portfolio.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.siteId, req.params.stackId);
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