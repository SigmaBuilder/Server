/* Archivo responsable de resolver el contexto del sitio público. */

'use strict';

const db = require('../config/db');
const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Resuelve el site público por slug.
 * Verifica que exista y que su status sea 'public'.
 */
const resolvePublicSiteContext = async (req, res, next) => {
  try {
    const { slug } = req.params;
    
    if (!slug) {
      throw new AppError('Slug is required', HTTP_STATUS.BAD_REQUEST);
    }

    const site = await db('sites').where({ slug }).first();

    if (!site) {
      throw new AppError('Site not found', HTTP_STATUS.NOT_FOUND);
    }

    // Permitir acceso si es la ruta de docs, o si viene con el flag preview=true
    const isDocs = req.path.endsWith('/docs');
    const isPreview = req.query.preview === 'true';

    if (!isDocs && !isPreview && site.status !== 'public') {
      throw new AppError('Site not found or not public', HTTP_STATUS.NOT_FOUND);
    }

    req.site = site;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = resolvePublicSiteContext;
