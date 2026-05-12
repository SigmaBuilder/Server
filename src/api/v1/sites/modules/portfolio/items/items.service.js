/* Servicio de portfolio_items */

'use strict';

const db = require('../../../../../../config/db');
const AppError = require('../../../../../../utils/AppError');
const HTTP_STATUS = require('../../../../../../constants/httpStatus');

/**
 * Retorna todos los elementos del portfolio ordenados por 'sort_order'
 * @param {string} siteId - ID del sitio.
 */
const getAll = async (siteId) => {
  const data = await db('portfolio_items')
    .where({ site_id: siteId })
    .orderBy('sort_order', 'asc');
  return data;
};

/**
 * Retorna un elemento del portfolio por ID.
 * @param {string} siteId - ID del sitio.
 * @param {string} id - ID del elemento del portfolio.
 */
const getById = async (siteId, id) => {
  const data = await db('portfolio_items')
    .where({ site_id: siteId, id })
    .first();
  if (!data) throw new AppError('PortfolioItem not found', HTTP_STATUS.NOT_FOUND);
  return data;
};

/**
 * Crea un nuevo elemento del portfolio.
 * @param {string} siteId - ID del sitio.
 * @param {Object} data - Datos del elemento del portfolio.
 */
const create = async (siteId, data) => {
  try {
    const [newItem] = await db('portfolio_items')
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
 * Actualiza un elemento del portfolio.
 * @param {string} siteId - ID del sitio.
 * @param {string} id - ID del elemento del portfolio.
 * @param {Object} updateData - Datos a actualizar.
 */
const update = async (siteId, id, updateData) => {
  try {
    const [updatedItem] = await db('portfolio_items')
      .where({ site_id: siteId, id })
      .update({ ...updateData })
      .returning('*');
    
    if (!updatedItem) throw new AppError('PortfolioItem not found', HTTP_STATUS.NOT_FOUND);
    return updatedItem;
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('Conflict: record already exists', HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
};

/**
 * Elimina un elemento del portfolio.
 * @param {string} siteId - ID del sitio.
 * @param {string} id - ID del elemento del portfolio.
 */
const remove = async (siteId, id) => {
  const deletedCount = await db('portfolio_items')
    .where({ site_id: siteId, id })
    .delete();
  if (deletedCount === 0) throw new AppError('PortfolioItem not found', HTTP_STATUS.NOT_FOUND);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
