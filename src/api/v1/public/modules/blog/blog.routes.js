'use strict';

const { Router } = require('express');
const controller = require('./blog.controller');

const router = Router();

router.get('/categories', controller.getPublicBlogCategories);
router.get('/posts', controller.getPublicBlogPosts);
router.get('/posts/:postSlug', controller.getPublicBlogPostBySlug);

module.exports = router;
