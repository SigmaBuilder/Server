'use strict';

const db = require('../../../../../config/db');

const getPages = async (siteId) => {
  return db('pages').where({ site_id: siteId }).orderBy('created_at', 'desc');
};

const getPageById = async (siteId, pageId) => {
  return db('pages').where({ site_id: siteId, id: pageId }).first();
};

const createPage = async (siteId, data) => {
  const [newPage] = await db('pages')
    .insert({
      site_id: siteId,
      slug: data.slug,
      title: data.title,
      html: data.html || '',
      css: data.css || '',
      js: data.js || '',
      status: data.status || 'draft'
    })
    .returning('*');
  return newPage;
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
  deletePage
};
