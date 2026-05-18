'use strict';

const db = require('../../../../../config/db');

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

module.exports = {
  getPortfolioData,
};
