/* Controladores de blog_posts */

'use strict';

const service = require('./posts.service');
const { sendSuccess } = require('../../../../../../utils/response');
const HTTP_STATUS = require('../../../../../../constants/httpStatus');

/**
 * Obtiene todos los posts del blog.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getAll = async (req, res, next) => {
  try {
    const data = await service.getAll(req.params.siteId);
    sendSuccess(res, { blogPosts: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Obtiene un post del blog por ID.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getById = async (req, res, next) => {
  try {
    const data = await service.getById(req.params.siteId, req.params.postId);
    sendSuccess(res, { blogPost: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Crea un nuevo post del blog.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const create = async (req, res, next) => {
  try {
    // Es vital inyectar el req.user.id como authorId en lugar de confiar en el req.body
    const authorId = req.user.id;
    const data = await service.create(req.params.siteId, authorId, req.body);
    sendSuccess(res, { blogPost: data }, HTTP_STATUS.CREATED);
  } catch (err) {
    next(err);
  }
};

/**
 * Actualiza un post del blog.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const update = async (req, res, next) => {
  try {
    const data = await service.update(req.params.siteId, req.params.postId, req.body);
    sendSuccess(res, { blogPost: data });
  } catch (err) {
    next(err);
  }
};

/**
 * Elimina un post del blog.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const remove = async (req, res, next) => {
  try {
    await service.remove(req.params.siteId, req.params.postId);
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
