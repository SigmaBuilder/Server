/* Servicio de portfolio_items */

'use strict';

const db = require('../../../../../config/db');
const AppError = require('../../../../../utils/AppError');
const HTTP_STATUS = require('../../../../../constants/httpStatus');

const getAll = async (siteId) => {
  const data = await db('portfolio_items')
    .where({ site_id: siteId })
    .orderBy('sort_order', 'asc');
  return data;
};

const getById = async (siteId, id) => {
  const data = await db('portfolio_items')
    .where({ site_id: siteId, id })
    .first();
  if (!data) throw new AppError('PortfolioItem not found', HTTP_STATUS.NOT_FOUND);
  return data;
};

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
