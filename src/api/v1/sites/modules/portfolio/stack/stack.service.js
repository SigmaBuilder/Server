/* Servicio de portfolio_stack */

'use strict'

const db = require('../../../../../../config/db');
const AppError = require('../../../../../../utils/AppError');
const HTTP_STATUS = require('../../../../../../constants/httpStatus');

/**
 * Retorna todos los elementos del stack del portfolio ordenados por 'sort_order'
 * @param {string} siteId - ID del sitio.
 * @returns {Promise<Array<Object>>} - Lista de elementos del stack del portfolio.
 */
const getAll = async (siteId) => {
  const data = await db('portfolio_stack')
    .where({ site_id: siteId })
    .orderBy('sort_order', 'asc');
  return data;
};

/**
 * Retorna un elemento del stack del portfolio por ID.
 * @param {string} siteId - ID del sitio.
 * @param {string} id - ID del elemento del stack del portfolio.
 * @returns {Promise<Object>} - Elemento del stack del portfolio.
 */
const getById = async (siteId, id) => {
  const data = await db('portfolio_stack')
    .where({ site_id: siteId, id })
    .first();
  if (!data) throw new AppError('PortfolioStack not found', HTTP_STATUS.NOT_FOUND);
  return data;
};

/**
 * Crea un nuevo elemento del stack del portfolio.
 * @param {string} siteId - ID del sitio.
 * @param {Object} data - Datos del elemento del stack del portfolio.
 * @returns {Promise<Object>} - Elemento del stack del portfolio creado.
 */
const create = async (siteId, data) => {
  try {
    const [newItem] = await db('portfolio_stack')
      .insert({ site_id: siteId, ...data })
      .returning('*');
    return newItem;
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('Conflict: record already exists', HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
};

/**
 * Actualiza un elemento del stack del portfolio.
 * @param {string} siteId - ID del sitio.
 * @param {string} id - ID del elemento del stack del portfolio.
 * @param {Object} updateData - Datos a actualizar.
 * @returns {Promise<Object>} - Elemento del stack del portfolio actualizado.
 */
const update = async (siteId, id, updateData) => {
  try {
    const [updatedItem] = await db('portfolio_stack')
      .where({ site_id: siteId, id })
      .update({ ...updateData })
      .returning('*');
    
    if (!updatedItem) throw new AppError('PortfolioStack not found', HTTP_STATUS.NOT_FOUND);
    return updatedItem;
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('Conflict: record already exists', HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
};

/**
 * Elimina un elemento del stack del portfolio.
 * @param {string} siteId - ID del sitio.
 * @param {string} id - ID del elemento del stack del portfolio.
 */
const remove = async (siteId, id) => {
  const deletedCount = await db('portfolio_stack')
    .where({ site_id: siteId, id })
    .delete();
  if (deletedCount === 0) throw new AppError('PortfolioStack not found', HTTP_STATUS.NOT_FOUND);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};