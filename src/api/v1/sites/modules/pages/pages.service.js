'use strict';

const db = require('../../../../../config/db');
const AppError = require('../../../../../utils/AppError');
const HTTP_STATUS = require('../../../../../constants/httpStatus');


const getPages = async (siteId, { page = 1, limit = 10, search = "" } = {}) => {
  const query = db('pages').where({ site_id: siteId });
  if (search) {
    query.andWhere(function () {
      this.where('title', 'ilike', `%${search}%`).orWhere('slug', 'ilike', `%${search}%`)
    });
  }
  const [{ count }] = await query.clone().count('id');
  const total = parseInt(count, 10);
  const data = await query.orderBy('created_at', 'desc')
    .limit(limit)
    .offset((page - 1) * limit);
  return { data, total };
};

const getPageById = async (siteId, pageId) => {
  return db('pages').where({ site_id: siteId, id: pageId }).first();
};

/**
 * Obtiene la página marcada como home de un sitio.
 * Usada por el endpoint público /render (sin slug).
 */
const getHomePage = async (siteId) => {
  return db('pages').where({ site_id: siteId, is_home: true }).first();
};

/**
 * Obtiene una página por su slug dentro de un sitio.
 * Usada por el endpoint público /render/:pageSlug.
 */
const getPageBySlug = async (siteId, slug) => {
  return db('pages').where({ site_id: siteId, slug }).first();
};


const createPage = async (siteId, data) => {
  const { count } = await db('pages').where({ site_id: siteId }).count('* as count').first();
  const isHome = parseInt(count) === 0;

  try {
    const [newPage] = await db('pages')
      .insert({
        site_id: siteId,
        slug: data.slug,
        title: data.title,
        html: data.html || '',
        css: data.css || '',
        js: data.js || '',
        status: data.status || 'draft',
        is_home: isHome
      })
      .returning('*');
    return newPage;
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('A page with this slug already exists for this site.', HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
};

const setHomePage = async (siteId, pageId) => {
  return db.transaction(async (trx) => {
    // 1. Quitar flag a todas las páginas de este sitio
    await trx('pages').where({ site_id: siteId }).update({ is_home: false });
    
    // 2. Poner flag a la nueva página index
    const [updatedPage] = await trx('pages')
      .where({ site_id: siteId, id: pageId })
      .update({ is_home: true })
      .returning('*');
      
    return updatedPage;
  });
};

const updatePage = async (siteId, pageId, data) => {
  const updateData = { ...data };
  delete updateData.id;
  delete updateData.site_id;
  delete updateData.created_at;

  try {
    const [updatedPage] = await db('pages')
      .where({ site_id: siteId, id: pageId })
      .update(updateData)
      .returning('*');
    return updatedPage;
  } catch (err) {
    if (err.code === '23505') {
      throw new AppError('A page with this slug already exists for this site.', HTTP_STATUS.CONFLICT);
    }
    throw err;
  }
};

const deletePage = async (siteId, pageId) => {
  const page = await getPageById(siteId, pageId);
  if (!page) return false;
  if (page.is_home) {
    throw new Error('HOME_PAGE_DELETION');
  }

  const deletedRows = await db('pages')
    .where({ site_id: siteId, id: pageId })
    .del();
  return deletedRows > 0;
};

module.exports = {
  getPages,
  getPageById,
  getHomePage,
  getPageBySlug,
  createPage,
  updatePage,
  setHomePage,
  deletePage
};