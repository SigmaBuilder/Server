/* Archivo para manejar la lógica de la API pública. */

'use strict';

const db = require('../../../config/db');
const AppError = require('../../../utils/AppError');
const HTTP_STATUS = require('../../../constants/httpStatus');

/**
 * Obtiene todos los datos del portfolio del sitio.
 * @param {*} siteId - ID del sitio
 * @returns {Promise<Object>} Datos del portfolio
 */
const getPortfolioData = async (siteId) => {
  const sections = await db('portfolio_sections')
    .where({ site_id: siteId })
    .orderBy('sort_order', 'asc');
    
  const items = await db('portfolio_items')
    .where({ site_id: siteId })
    .orderBy('sort_order', 'asc');
    
  const stack = await db('portfolio_stack')
    .where({ site_id: siteId })
    .orderBy('created_at', 'asc');

  return { sections, items, stack };
};

/**
 * Obtiene todas las categorías del blog del sitio.
 * @param {*} siteId - ID del sitio
 * @returns {Promise<Array<Object>>} Lista de categorías
 */
const getBlogCategories = async (siteId) => {
  return await db('blog_categories')
    .where({ site_id: siteId })
    .orderBy('name', 'asc');
};

/**
 * Obtiene todos los posts del blog del sitio.
 * @param {*} siteId - ID del sitio
 * @param {*} limit - Número de posts por página
 * @param {*} offset - Offset de posts
 * @returns {Promise<Object>} Lista de posts y total
 */
const getBlogPosts = async (siteId, limit = 10, offset = 0) => {
  const posts = await db('blog_posts')
    .where({ site_id: siteId, status: 'published' })
    .orderBy('created_at', 'desc')
    .limit(limit)
    .offset(offset);
    
  const [{ count }] = await db('blog_posts')
    .where({ site_id: siteId, status: 'published' })
    .count('id as count');

  return {
    posts,
    total: parseInt(count, 10),
  };
};

/**
 * Obtiene un post del blog por su slug.
 * @param {*} siteId - ID del sitio
 * @param {*} slug - Slug del post
 * @returns {Promise<Object>} Post del blog
 */
const getBlogPostBySlug = async (siteId, slug) => {
  const post = await db('blog_posts')
    .where({ site_id: siteId, slug, status: 'published' })
    .first();
    
  if (!post) {
    throw new AppError('Blog post not found or not published', HTTP_STATUS.NOT_FOUND);
  }
  
  return post;
};

module.exports = {
  getPortfolioData,
  getBlogCategories,
  getBlogPosts,
  getBlogPostBySlug,
};
