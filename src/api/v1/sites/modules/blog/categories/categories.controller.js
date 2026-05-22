/* Controladores de blog_categories */

'use strict'

const service = require('./categories.service');
const { sendSuccess } = require('../../../../../../utils/response');
const HTTP_STATUS = require('../../../../../../constants/httpStatus');

/**
 * Obtiene todas las categorias del blog
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll(req.params.siteId);
    sendSuccess(res, { blogCategories: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Obtiene una categoria del blog por ID
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.siteId, req.params.categoryId);
    sendSuccess(res, { blogCategory: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Crea una nueva categoria del blog
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const create = async (req, res, next) => {
  try {
    const data = await service.create(req.params.siteId, req.body);
    sendSuccess(res, { blogCategory: data }, HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

/**
 * Actualiza una categoria del blog
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.siteId, req.params.categoryId, req.body);
    sendSuccess(res, { blogCategory: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Elimina una categoria del blog
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.siteId, req.params.categoryId);
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