'use strict';

/**
 * Extrae y valida los parámetros de paginación y búsqueda de la request.
 * @param {Object} req - Objeto de petición Express.
 * @returns {{ page: number, limit: number, search: string }}
 */
const getPaginationParams = (req) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const search = req.query.search || '';

  return {
    page: page > 0 ? page : 1,
    limit: limit > 0 ? limit : 10,
    search: search.trim()
  };
};

/**
 * Formatea la respuesta paginada con los metadatos correspondientes.
 * @param {Array} data - Los resultados de la página actual.
 * @param {number} total - El total de elementos.
 * @param {number} page - La página actual.
 * @param {number} limit - El límite de elementos por página.
 * @returns {Object} Objeto formateado para la respuesta.
 */
const formatPaginatedResponse = (data, total, page, limit) => {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    }
  };
};

module.exports = {
  getPaginationParams,
  formatPaginatedResponse
};
