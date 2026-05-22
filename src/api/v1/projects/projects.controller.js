/* Controladores de rutas de projects. */

'use strict';

const projectsService = require('./projects.service');
const { sendSuccess } = require('../../../utils/response');
const HTTP_STATUS = require('../../../constants/httpStatus');

/**
 * Obtiene todos los proyectos de un usuario.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getAll = async (req, res, next) => {
  try {
    const projects = await projectsService.getProjectsForUser(req.user.id);
    sendSuccess(res, { projects });
  } catch (err) { next(err); }
};

/**
 * Obtiene un proyecto por su ID.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getOne = async (req, res, next) => {
  try {
    const project = await projectsService.getProjectById(req.params.projectId);
    sendSuccess(res, { project });
  } catch (err) { next(err); }
};

/**
 * Crea un nuevo proyecto.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const create = async (req, res, next) => {
  try {
    const project = await projectsService.createProject(req.body, req.user.id);
    sendSuccess(res, { project }, HTTP_STATUS.CREATED);
  } catch (err) { next(err); }
};

/**
 * Actualiza un proyecto.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const update = async (req, res, next) => {
  try {
    const project = await projectsService.updateProject(req.params.projectId, req.body);
    sendSuccess(res, { project });
  } catch (err) { next(err); }
};

/**
 * Elimina un proyecto.
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const remove = async (req, res, next) => {
  try {
    await projectsService.deleteProject(req.params.projectId);
    sendSuccess(res, null, HTTP_STATUS.NO_CONTENT);
  } catch (err) { next(err); }
};

module.exports = { getAll, getOne, create, update, remove };
