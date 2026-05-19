'use strict';

const db = require('../../../../../config/db');

const getPages = async (siteId) => {
  return db('pages').where({ site_id: siteId }).orderBy('created_at', 'desc');
};

const getPageById = async (siteId, pageId) => {
  return db('pages').where({ site_id: siteId, id: pageId }).first();
};

const createPage = async (siteId, data) => {
  const { count } = await db('pages').where({ site_id: siteId }).count('* as count').first();
  const isHome = parseInt(count) === 0;

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

  const [updatedPage] = await db('pages')
    .where({ site_id: siteId, id: pageId })
    .update(updateData)
    .returning('*');
  return updatedPage;
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
  createPage,
  updatePage,
  setHomePage,
  deletePage
};
