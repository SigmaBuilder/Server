/* Controladores para la API pública. */

'use strict';

const publicService = require('./public.service');

/**
 * Obtiene la información del sitio.
 * @param {Object} req - Objeto de request
 * @param {Object} res - Objeto de response
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>}
 */
const getPublicSiteInfo = (req, res, next) => {
  try {
    const { id, name, slug, template_type, features, content } = req.site;
    
    res.json({
      site: { id, name, slug, template_type, features, content }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene el portfolio del sitio.
 * @param {Object} req - Objeto de request
 * @param {Object} res - Objeto de response
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>}
 */
const getPublicPortfolio = async (req, res, next) => {
  try {
    const { id: siteId } = req.site;
    const portfolioData = await publicService.getPortfolioData(siteId);
    
    res.json({
      portfolio: portfolioData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene las categorías del blog del sitio.
 * @param {Object} req - Objeto de request
 * @param {Object} res - Objeto de response
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>}
 */
const getPublicBlogCategories = async (req, res, next) => {
  try {
    const { id: siteId } = req.site;
    const categories = await publicService.getBlogCategories(siteId);
    
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene los posts del blog del sitio.
 * @param {Object} req - Objeto de request
 * @param {Object} res - Objeto de response
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>}
 */
const getPublicBlogPosts = async (req, res, next) => {
  try {
    const { id: siteId } = req.site;
    
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;
    
    const data = await publicService.getBlogPosts(siteId, limit, offset);
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

/**
 * Obtiene un post del blog por su slug.
 * @param {Object} req - Objeto de request
 * @param {Object} res - Objeto de response
 * @param {Function} next - Función para pasar al siguiente middleware.
 * @returns {Promise<void>}
 */
const getPublicBlogPostBySlug = async (req, res, next) => {
  try {
    const { id: siteId } = req.site;
    const { postSlug } = req.params;
    
    const post = await publicService.getBlogPostBySlug(siteId, postSlug);
    
    res.json({ post });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicSiteInfo,
  getPublicPortfolio,
  getPublicBlogCategories,
  getPublicBlogPosts,
  getPublicBlogPostBySlug,
};
