/* Controladores de rutas globales de sites. */

'use strict';

const sitesService = require('./sites.service');
const { sendSuccess } = require('../../../utils/response');

/**
 * Obtiene un site por su slug globalmente (verificando que el usuario tenga acceso a su proyecto).
 * @param {Object} req - Objeto de petición.
 * @param {Object} res - Objeto de respuesta.
 * @param {Function} next - Función para pasar al siguiente middleware.
 */
const getSiteBySlugGlobal = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const includeProject = req.query.includeProject === 'true';
    const userId = req.user.id;

    const result = await sitesService.getSiteBySlugGlobal(slug, userId, includeProject);
    sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSiteBySlugGlobal,
};
