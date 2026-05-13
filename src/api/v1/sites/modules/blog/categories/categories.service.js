/* Servicio de blog_categories */

'use strict'

const db = require('../../../../../../config/db');
const AppError = require('../../../../../../utils/AppError');
const HTTP_STATUS = require('../../../../../../constants/httpStatus');

/**
 * Retorna todas las categorias del blog
 * @param {string} siteId - ID del sitio
 * @returns {Promise<Array<Object>>} - Lista de categorias del blog
 */
const getAll = async (siteId) => {
  const data = await db('blog_categories')
    .where({ site_id: siteId })
    .orderBy('created_at', 'asc');
  return data;
};

/**
 * Retorna una categoria del blog por ID
 * @param {string} siteId - ID del sitio
 * @param {string} id - ID de la categoria del blog
 * @returns {Promise<Object>} - Categoria del blog
 */
const getById = async (siteId, id) => {
  const data = await db('blog_categories')
    .where({ site_id: siteId, id })
    .first();
  if (!data) throw new AppError('BlogCategory not found', HTTP_STATUS.NOT_FOUND);
  return data;
};

/**
 * Crea una nueva categoria del blog
 * @param {string} siteId - ID del sitio
 * @param {Object} data - Datos de la categoria del blog
 * @returns {Promise<Object>} - Categoria del blog creada
 */
const create = async (siteId, data) => {
  try {
    const [newItem] = await db('blog_categories')
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
 * Actualiza una categoria del blog
 * @param {string} siteId - ID del sitio
 * @param {string} id - ID de la categoria del blog
 * @param {Object} updateData - Datos a actualizar
 * @returns {Promise<Object>} - Categoria del blog actualizada
 */
const update = async (siteId, id, updateData) => {
  try {
    const [updatedItem] = await db('blog_categories')
      .where({ site_id: siteId, id })
      .update({ ...updateData })
      .returning('*');
    
    if (!updatedItem) throw new AppError('BlogCategory not found', HTTP_STATUS.NOT_FOUND);
    return updatedItem;
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('Conflict: record already exists', HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
};

/**
 * Elimina una categoria del blog
 * @param {string} siteId - ID del sitio
 * @param {string} id - ID de la categoria del blog
 */
const remove = async (siteId, id) => {
  const deletedCount = await db('blog_categories')
    .where({ site_id: siteId, id })
    .delete();
  if (deletedCount === 0) throw new AppError('BlogCategory not found', HTTP_STATUS.NOT_FOUND);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};