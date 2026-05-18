'use strict';

const db = require('../../../../../config/db');
const AppError = require('../../../../../utils/AppError');
const HTTP_STATUS = require('../../../../../constants/httpStatus');

const getBlogCategories = async (siteId) => {
  return await db('blog_categories')
    .where({ site_id: siteId })
    .orderBy('name', 'asc');
};

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
  getBlogCategories,
  getBlogPosts,
  getBlogPostBySlug,
};
