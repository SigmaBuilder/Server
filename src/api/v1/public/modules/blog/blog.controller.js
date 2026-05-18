'use strict';

const blogService = require('./blog.service');

const getPublicBlogCategories = async (req, res, next) => {
  try {
    const { id: siteId } = req.site;
    const categories = await blogService.getBlogCategories(siteId);
    
    res.json({ categories });
  } catch (error) {
    next(error);
  }
};

const getPublicBlogPosts = async (req, res, next) => {
  try {
    const { id: siteId } = req.site;
    
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = parseInt(req.query.offset, 10) || 0;
    
    const data = await blogService.getBlogPosts(siteId, limit, offset);
    
    res.json(data);
  } catch (error) {
    next(error);
  }
};

const getPublicBlogPostBySlug = async (req, res, next) => {
  try {
    const { id: siteId } = req.site;
    const { postSlug } = req.params;
    
    const post = await blogService.getBlogPostBySlug(siteId, postSlug);
    
    res.json({ post });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPublicBlogCategories,
  getPublicBlogPosts,
  getPublicBlogPostBySlug,
};
