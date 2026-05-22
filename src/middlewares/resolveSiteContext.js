'use strict';

const db = require('../config/db');
const AppError = require('../utils/AppError');
const HTTP_STATUS = require('../constants/httpStatus');

/**
 * Middleware que intercepta un :siteId de la URL, busca su project_id en la base de datos,
 * y lo inyecta en req.projectId para que los middlewares de autorización posteriores
 * puedan verificar los permisos correctamente.
 */
const attachProjectFromSite = async (req, res, next) => {
  try {
    // Si la ID del sitio viene como siteId o como id, o si hay un slug
    const siteId = req.params.siteId || req.params.id;
    const slug = req.params.slug;
    
    if (!siteId && !slug) {
      return next(new AppError('Site ID or slug is required in URL parameters', HTTP_STATUS.BAD_REQUEST));
    }

    let query = db('sites').select('project_id');
    if (siteId) {
      query = query.where({ id: siteId });
    } else {
      query = query.where({ slug });
    }

    const site = await query.first();

    if (!site) {
      return next(new AppError('Site not found', HTTP_STATUS.NOT_FOUND));
    }

    // Inyectar el projectId para que authorize() lo encuentre
    req.projectId = site.project_id;
    
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = attachProjectFromSite;
