/* Servicio de blog_posts */

'use strict';

const db = require('../../../../../../config/db');
const AppError = require('../../../../../../utils/AppError');
const HTTP_STATUS = require('../../../../../../constants/httpStatus');

/**
 * Retorna todos los posts del blog para un sitio dado.
 * @param {string} siteId - ID del sitio.
 * @returns {Promise<Array<Object>>} - Lista de posts.
 */
const getAll = async (siteId) => {
  const data = await db('blog_posts')
    .where({ site_id: siteId })
    .orderBy('created_at', 'desc'); // Lo ideal para posts es mostrar los más recientes primero
  return data;
};

/**
 * Retorna un post del blog por ID.
 * @param {string} siteId - ID del sitio.
 * @param {string} id - ID del post.
 * @returns {Promise<Object>} - Post del blog.
 */
const getById = async (siteId, id) => {
  const data = await db('blog_posts')
    .where({ site_id: siteId, id })
    .first();
  if (!data) throw new AppError('BlogPost not found', HTTP_STATUS.NOT_FOUND);
  return data;
};

/**
 * Crea un nuevo post del blog.
 * @param {string} siteId - ID del sitio.
 * @param {string} authorId - ID del usuario autor (req.user.id).
 * @param {Object} data - Datos del post.
 * @returns {Promise<Object>} - Post creado.
 */
const create = async (siteId, authorId, data) => {
  try {
    // Si se envía category_id, deberíamos asegurarnos opcionalmente de que
    // esa categoría realmente pertenezca a este sitio para evitar inconsistencias.
    if (data.category_id) {
      const category = await db('blog_categories')
        .where({ id: data.category_id, site_id: siteId })
        .first();
      
      if (!category) {
        throw new AppError('Category does not exist or does not belong to this site', HTTP_STATUS.BAD_REQUEST);
      }
    }

    const [newItem] = await db('blog_posts')
      .insert({ ...data, site_id: siteId, author_id: authorId })
      .returning('*');
    return newItem;
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('Conflict: post with this slug already exists for this site', HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
};

/**
 * Actualiza un post del blog.
 * @param {string} siteId - ID del sitio.
 * @param {string} id - ID del post.
 * @param {Object} updateData - Datos a actualizar.
 * @returns {Promise<Object>} - Post actualizado.
 */
const update = async (siteId, id, updateData) => {
  try {
    // Si se está actualizando la categoría, verificamos igual que en create
    if (updateData.category_id) {
      const category = await db('blog_categories')
        .where({ id: updateData.category_id, site_id: siteId })
        .first();
      
      if (!category) {
        throw new AppError('Category does not exist or does not belong to this site', HTTP_STATUS.BAD_REQUEST);
      }
    }

    // Prevenir que el cliente sobrescriba campos protegidos
    delete updateData.id;
    delete updateData.site_id;
    delete updateData.author_id;

    const [updatedItem] = await db('blog_posts')
      .where({ site_id: siteId, id })
      .update({ ...updateData })
      .returning('*');
    
    if (!updatedItem) throw new AppError('BlogPost not found', HTTP_STATUS.NOT_FOUND);
    return updatedItem;
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('Conflict: post with this slug already exists for this site', HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
};

/**
 * Elimina un post del blog.
 * @param {string} siteId - ID del sitio.
 * @param {string} id - ID del post.
 */
const remove = async (siteId, id) => {
  const deletedCount = await db('blog_posts')
    .where({ site_id: siteId, id })
    .delete();
  if (deletedCount === 0) throw new AppError('BlogPost not found', HTTP_STATUS.NOT_FOUND);
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
};
