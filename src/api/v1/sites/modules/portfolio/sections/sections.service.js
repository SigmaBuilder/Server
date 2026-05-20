/* Servicio de portfolio_sections */

'use strict';

const db = require('../../../../../../config/db');
const AppError = require('../../../../../../utils/AppError');
const HTTP_STATUS = require('../../../../../../constants/httpStatus');

/**
 * Retorna todas las secciones del portfolio ordenadas por 'sort_order'
 * @param {string} siteId - ID del sitio.
 * @returns {Promise<Array<Object>>} - Lista de secciones del portfolio.
 */
const getAll = async (siteId, { page = 1, limit = 10, search = "" } = {}) => {
  const query = db('portfolio_sections').where({ site_id: siteId });
  if (search) {
    query.andWhere(function () {
      this.where('title', 'ilike', `%${search}%`)
    });
  }
  const [{ count }] = await query.clone().count('id');
  const total = parseInt(count, 10);
  const data = await query.orderBy('sort_order', 'asc')
    .limit(limit)
    .offset((page - 1) * limit);
  return { data, total };
};

/**
 * Retorna una sección del portfolio por ID.
 * @param {string} siteId - ID del sitio.
 * @param {string} id - ID de la sección del portfolio.
 * @returns {Promise<Object>} - Sección del portfolio.
 */
const getById = async (siteId, id) => {
  const data = await db('portfolio_sections')
    .where({ site_id: siteId, id })
    .first();
  if (!data) throw new AppError('PortfolioSection not found', HTTP_STATUS.NOT_FOUND);
  return data;
};

/**
 * Crea una nueva sección del portfolio.
 * @param {string} siteId - ID del sitio.
 * @param {Object} data - Datos de la sección del portfolio.
 * @returns {Promise<Object>} - Sección del portfolio creada.
 */
const create = async (siteId, data) => {
  try {
    const [newSection] = await db('portfolio_sections')
      .insert({ site_id: siteId, ...data })
      .returning('*');
    return newSection;
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('Conflict: record already exists', HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
};

/**
 * Actualiza una sección del portfolio.
 * @param {string} siteId - ID del sitio.
 * @param {string} id - ID de la sección del portfolio.
 * @param {Object} updateData - Datos a actualizar.
 * @returns {Promise<Object>} - Sección del portfolio actualizada.
 */
const update = async (siteId, id, updateData) => {
  try {
    const [updatedSection] = await db('portfolio_sections')
      .where({ site_id: siteId, id })
      .update({ ...updateData })
      .returning('*');
    
    if (!updatedSection) throw new AppError('PortfolioSection not found', HTTP_STATUS.NOT_FOUND);
    return updatedSection;
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('Conflict: record already exists', HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
};

/**
 * Elimina una sección del portfolio.
 * @param {string} siteId - ID del sitio.
 * @param {string} id - ID de la sección del portfolio.
 */
const remove = async (siteId, id) => {
  const deletedCount = await db('portfolio_sections')
    .where({ site_id: siteId, id })
    .delete();
  if (deletedCount === 0) throw new AppError('PortfolioSection not found', HTTP_STATUS.NOT_FOUND);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};